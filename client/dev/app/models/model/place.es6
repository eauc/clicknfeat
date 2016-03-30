(function() {
  angular.module('clickApp.services')
    .factory('modelPlace', modelPlaceModelFactory);

  modelPlaceModelFactory.$inject = [
    'point',
  ];
  function modelPlaceModelFactory(pointModel) {
    const PLACE_EPSILON = 0.1;
    return (MOVES, modelModel) => {
      const modelPlaceModel = {
        startPlaceP: modelStartPlaceP,
        isPlacing: modelIsPlacing,
        endPlace: modelEndPlace,
        setPlaceOriginP: modelSetPlaceOriginP,
        setPlaceTargetP: modelSetPlaceTargetP,
        placeMaxLength: modelPlaceMaxLength,
        setPlaceMaxLengthP: modelSetPlaceMaxLengthP,
        placeWithin: modelPlaceWithin,
        setPlaceWithinP: modelSetPlaceWithinP,
        moveFrontPlaceP: modelMoveFrontPlaceP,
        moveBackPlaceP: modelMoveBackPlaceP,
        rotateLeftPlaceP: modelRotateLeftPlaceP,
        rotateRightPlaceP: modelRotateRightPlaceP,
        shiftLeftPlaceP: modelShiftLeftPlaceP,
        shiftRightPlaceP: modelShiftRightPlaceP,
        shiftUpPlaceP: modelShiftUpPlaceP,
        shiftDownPlaceP: modelShiftDownPlaceP
      };
      const ensurePlaceLength$ = R.curry(ensurePlaceLength);
      modelModel.state_checkers = R.append(ensurePlaceLength$, modelModel.state_checkers);
      const updatePlaceDirection$ = R.curry(updatePlaceDirection);
      modelModel.state_updaters = R.append(updatePlaceDirection$, modelModel.state_updaters);
      return modelPlaceModel;

      function modelStartPlaceP(model) {
        return R.threadP(model)(
          R.rejectIfP(modelModel.isLocked,
                     'Model is locked'),
          R.assocPath(['state','pla'],
                      { s: R.pick(['x','y','r'], model.state) })
        );
      }
      function modelIsPlacing(model) {
        return R.exists(model.state.pla);
      }
      function modelEndPlace(model) {
        return R.assocPath(['state','pla'], null, model);
      }
      function modelSetPlaceOriginP(factions, other, model) {
        return R.threadP(model)(
          R.rejectIfP(modelModel.isLocked,
                     'Model is locked'),
          () => {
            const direction = pointModel
                    .directionTo(model.state.pla.s, other.state);
            return R.thread(model)(
              R.over(R.lensProp('state'),
                     pointModel.rotateAroundTo$(direction, model.state.pla.s)),
              R.assocPath(['state','pla','s','r'], direction)
            );
          },
          modelModel.checkStateP$(factions, null)
        );
      }
      function modelSetPlaceTargetP(factions, other, model) {
        return R.threadP(model)(
          R.rejectIfP(modelModel.isLocked,
                     'Model is locked'),
          () => {
            const direction = pointModel
                    .directionTo(other.state, model.state.pla.s);
            return R.thread(model)(
              R.over(R.lensProp('state'),
                     pointModel.rotateAroundTo$(direction, model.state.pla.s)),
              R.assocPath(['state','pla','s','r'], direction)
            );
          },
          modelModel.checkStateP$(factions, null)
        );
      }
      function modelPlaceMaxLength(model) {
        return R.head(R.path(['state','pml'], model));
      }
      function modelSetPlaceMaxLengthP(factions, value, model) {
        model = R.assocPath(['state','pml'], [ value, model.state.pml[1] ], model);
        return modelModel.checkStateP(factions, null, model);
      }
      function modelPlaceWithin(model) {
        return R.nth(1, R.pathOr([], ['state','pml'], model));
      }
      function modelSetPlaceWithinP(factions, value, model) {
        model = R.assocPath(['state','pml'], [ model.state.pml[0], value ], model);
        return modelModel.checkStateP(factions, null, model);
      }
      function modelMoveFrontPlaceP(factions, small, model) {
        return R.threadP(model)(
          R.rejectIfP(modelModel.isLocked,
                     'Model is locked'),
          () => {
            const dist = MOVES[small ? 'MoveSmall' : 'Move'];
            const direction = model.state.pla.s.r;
            return R.over(R.lensProp('state'),
                          pointModel.translateInDirection$(dist, direction),
                          model);
          },
          modelModel.checkStateP$(factions, null)
        );
      }
      function modelMoveBackPlaceP(factions, small, model) {
        return R.threadP(model)(
          R.rejectIfP(modelModel.isLocked,
                     'Model is locked'),
          () => {
            let dist = MOVES[small ? 'MoveSmall' : 'Move'];
            const direction = model.state.pla.s.r+180;
            const distance = pointModel
                    .distanceTo(model.state, model.state.pla.s);
            if(dist > distance) dist = distance;
            return R.over(R.lensProp('state'),
                          pointModel.translateInDirection$(dist, direction),
                          model);
          },
          modelModel.checkStateP$(factions, null)
        );
      }
      function modelRotateLeftPlaceP(factions, small, model) {
        return R.threadP(model)(
          R.rejectIfP(modelModel.isLocked,
                     'Model is locked'),
          () => {
            const angle = MOVES[small ? 'RotateChargeSmall' : 'RotateCharge'];
            return R.thread(model)(
              R.over(R.lensProp('state'),
                     pointModel.rotateLeftAround$(angle, model.state.pla.s)),
              R.over(R.lensPath(['state','pla','s','r']), R.subtract(R.__, angle))
            );
          },
          modelModel.checkStateP$(factions, null)
        );
      }
      function modelRotateRightPlaceP(factions, small, model) {
        return R.threadP(model)(
          R.rejectIfP(modelModel.isLocked,
                     'Model is locked'),
          () => {
            const angle = MOVES[small ? 'RotateChargeSmall' : 'RotateCharge'];
            return R.thread(model)(
              R.over(R.lensProp('state'),
                     pointModel.rotateRightAround$(angle, model.state.pla.s)),
              R.over(R.lensPath(['state', 'pla','s','r']), R.add(angle))
            );
          },
          modelModel.checkStateP$(factions, null)
        );
      }
      function modelShiftLeftPlaceP(factions, small, model) {
        return R.threadP(model)(
          R.rejectIfP(modelModel.isLocked,
                     'Model is locked'),
          () => {
            const dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
            return R.over(R.lensProp('state'),
                          pointModel.shiftLeft$(dist),
                          model);
          },
          modelModel.checkStateP$(factions, null)
        );
      }
      function modelShiftRightPlaceP(factions, small, model) {
        return R.threadP(model)(
          R.rejectIfP(modelModel.isLocked,
                     'Model is locked'),
          () => {
            const dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
            return R.over(R.lensProp('state'),
                          pointModel.shiftRight$(dist),
                          model);
          },
          modelModel.checkStateP$(factions, null)
        );
      }
      function modelShiftUpPlaceP(factions, small, model) {
        return R.threadP(model)(
          R.rejectIfP(modelModel.isLocked,
                     'Model is locked'),
          () => {
            const dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
            return R.over(R.lensProp('state'),
                          pointModel.shiftUp$(dist),
                          model);
          },
          modelModel.checkStateP$(factions, null)
        );
      }
      function modelShiftDownPlaceP(factions, small, model) {
        return R.threadP(model)(
          R.rejectIfP(modelModel.isLocked,
                     'Model is locked'),
          () => {
            const dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
            return R.over(R.lensProp('state'),
                          pointModel.shiftDown$(dist),
                          model);
          },
          modelModel.checkStateP$(factions, null)
        );
      }
      function ensurePlaceLength(info, _target_, state) {
        if(R.exists(state.pla) &&
           R.exists(state.pml) &&
           state.pml[0] > 0) {
          const distance = pointModel.distanceTo(state, state.pla.s);
          const max_dist = state.pml[0] * 10 + (state.pml[1] ? info.base_radius * 2 : 0);
          if(distance > max_dist) {
            const direction = pointModel.directionTo(state, state.pla.s);
            const position = pointModel.translateInDirection(max_dist, direction,
                                                             state.pla.s);
            return R.thread(state)(
              R.assoc('x', position.x),
              R.assoc('y', position.y)
            );
          }
        }
        return state;
      }
      function updatePlaceDirection(state) {
        if(R.exists(state.pla)) {
          const distance = pointModel.distanceTo(state, state.pla.s);
          if(distance > PLACE_EPSILON) {
            const direction = pointModel.directionTo(state, state.pla.s);
            return R.assocPath(['pla','s','r'], direction, state);
          }
        }
        return state;
      }
    };
  }
})();
