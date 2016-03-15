(function() {
  angular.module('clickApp.services')
    .factory('modelMove', modelMoveModelFactory);

  modelMoveModelFactory.$inject = [
    'settings',
    'point',
  ];
  function modelMoveModelFactory(settingsModel,
                                 pointModel) {
    return (MOVES, modelModel) => {
      const modelMoveModel = {
        setPositionP: moveModel(modelSetPositionP, true),
        setPosition_: modelSetPosition_,
        shiftPositionP: moveModel(modelShiftPositionP, true),
        setOrientationP: moveModel(modelSetOrientationP, false),
        orientToP: moveModel(modelOrientToP, false),
        moveFrontP: moveModel(modelMoveFrontP, false),
        moveBackP: moveModel(modelMoveBackP, false),
        rotateLeftP: moveModel(modelRotateLeftP, false),
        rotateRightP: moveModel(modelRotateRightP, false),
        shiftLeftP: moveModel(modelShiftLeftP, false),
        shiftRightP: moveModel(modelShiftRightP, false),
        shiftUpP: moveModel(modelShiftUpP, false),
        shiftDownP: moveModel(modelShiftDownP, false)
      };
      return modelMoveModel;

      function moveModel(move, withTarget) {
        return function(...args) {
          const model = R.last(args);
          const factions = R.head(args);
          const target = (withTarget ? R.nth(1, args) : null);
          return R.threadP(model)(
            R.rejectIf(modelModel.isLocked,
                       'Model is locked'),
            () => move.apply(this, args),
            modelModel.checkStateP$(factions, target)
          );
        };
      }
      function modelSetPositionP(factions, target, pos, model) {
        return R.pipe(
          R.assocPath(['state','x'], pos.x),
          R.assocPath(['state','y'], pos.y)
        )(model);
      }
      function modelSetPosition_(factions, target, pos, model) {
        return R.threadP(model)(
          R.rejectIf(modelModel.isLocked,
                     'Model is locked'),
          R.assocPath(['state','x'], pos.x),
          R.assocPath(['state','y'], pos.y),
          modelModel.checkStateP$(factions, target),
          (check) => {
            model.state = check.state;
            return model;
          }
        );
      }
      function modelShiftPositionP(factions, target, shift, model) {
        return R.pipe(
          R.over(R.lensPath(['state','x']), R.add(shift.x)),
          R.over(R.lensPath(['state','y']), R.add(shift.y))
        )(model);
      }
      function modelSetOrientationP(factions, orientation, model) {
        return R.assocPath(['state','r'], orientation, model);
      }
      function modelOrientToP(factions, other, model) {
        return R.assocPath(['state','r'],
                           pointModel.directionTo(other.state, model.state),
                           model);
      }
      function modelMoveFrontP(factions, small, model) {
        const dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.over(R.lensProp('state'),
                      pointModel.moveFront$(dist),
                      model);
      }
      function modelMoveBackP(factions, small, model) {
        const dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.over(R.lensProp('state'),
                      pointModel.moveBack$(dist),
                      model);
      }
      function modelRotateLeftP(factions, small, model) {
        const angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
        return R.over(R.lensProp('state'),
                      pointModel.rotateLeft$(angle),
                      model);
      }
      function modelRotateRightP(factions, small, model) {
        const angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
        return R.over(R.lensProp('state'),
                      pointModel.rotateRight$(angle),
                      model);
      }
      function modelShiftLeftP(factions, small, model) {
        const dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
        return R.over(R.lensProp('state'),
                      pointModel.shiftLeft$(dist),
                      model);
      }
      function modelShiftRightP(factions, small, model) {
        const dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
        return R.over(R.lensProp('state'),
                      pointModel.shiftRight$(dist),
                      model);
      }
      function modelShiftUpP(factions, small, model) {
        const dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
        return R.over(R.lensProp('state'),
                      pointModel.shiftUp$(dist),
                      model);
      }
      function modelShiftDownP(factions, small, model) {
        const dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
        return R.over(R.lensProp('state'),
                      pointModel.shiftDown$(dist),
                      model);
      }
    };
  }
})();
