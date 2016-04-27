(function() {
  angular.module('clickApp.services')
    .factory('modelMove', modelMoveModelFactory);

  modelMoveModelFactory.$inject = [
    'point',
  ];
  function modelMoveModelFactory(pointModel) {
    const STATE_LENS = R.lensProp('state');
    const X_LENS = R.lensPath(['state','x']);
    const Y_LENS = R.lensPath(['state','y']);
    return (MOVES, modelModel) => {
      const modelMoveModel = {
        setPositionP: moveModel(modelSetPosition, true),
        setPositionP_: modelSetPositionP_,
        shiftPositionP: moveModel(modelShiftPosition, true),
        setOrientationP: moveModel(modelSetOrientation, false),
        orientToP: moveModel(modelOrientTo, false),
        moveFrontP: moveModel(modelMoveFront, false),
        moveBackP: moveModel(modelMoveBack, false),
        rotateLeftP: moveModel(modelRotateLeft, false),
        rotateRightP: moveModel(modelRotateRight, false),
        shiftLeftP: moveModel(modelShiftLeft, false),
        shiftRightP: moveModel(modelShiftRight, false),
        shiftUpP: moveModel(modelShiftUp, false),
        shiftDownP: moveModel(modelShiftDown, false)
      };
      return modelMoveModel;

      function moveModel(move, withTarget) {
        return function(...args) {
          const model = R.last(args);
          const factions = R.head(args);
          const target = (withTarget ? R.nth(1, args) : null);
          return R.threadP(model)(
            R.rejectIfP(modelModel.isLocked,
                       'Model is locked'),
            () => move.apply(this, args),
            modelModel.checkState$(factions, target)
          );
        };
      }
      function modelSetPosition(_factions_, _target_, pos, model) {
        return R.pipe(
          R.set(X_LENS, pos.x),
          R.set(Y_LENS, pos.y)
        )(model);
      }
      function modelSetPositionP_(factions, target, pos, model) {
        return R.threadP(model)(
          R.rejectIfP(modelModel.isLocked,
                     'Model is locked'),
          R.set(X_LENS, pos.x),
          R.set(Y_LENS, pos.y),
          modelModel.checkState$(factions, target),
          (check) => {
            model.state = check.state;
            return model;
          }
        );
      }
      function modelShiftPosition(_factions_, _target_, shift, model) {
        return R.pipe(
          R.over(X_LENS, R.add(shift.x)),
          R.over(Y_LENS, R.add(shift.y))
        )(model);
      }
      function modelSetOrientation(_factions_, orientation, model) {
        return R.assocPath(['state','r'], orientation, model);
      }
      function modelOrientTo(_factions_, other, model) {
        return R.assocPath(['state','r'],
                           pointModel.directionTo(other.state, model.state),
                           model);
      }
      function modelMoveFront(_factions_, small, model) {
        const dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.over(
          STATE_LENS,
          pointModel.moveFront$(dist),
          model
        );
      }
      function modelMoveBack(_factions_, small, model) {
        const dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.over(
          STATE_LENS,
          pointModel.moveBack$(dist),
          model
        );
      }
      function modelRotateLeft(_factions_, small, model) {
        const angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
        return R.over(
          STATE_LENS,
          pointModel.rotateLeft$(angle),
          model
        );
      }
      function modelRotateRight(_factions_, small, model) {
        const angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
        return R.over(
          STATE_LENS,
          pointModel.rotateRight$(angle),
          model
        );
      }
      function modelShiftLeft(_factions_, small, model) {
        const dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
        return R.over(
          STATE_LENS,
          pointModel.shiftLeft$(dist),
          model
        );
      }
      function modelShiftRight(_factions_, small, model) {
        const dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
        return R.over(
          STATE_LENS,
          pointModel.shiftRight$(dist),
          model
        );
      }
      function modelShiftUp(_factions_, small, model) {
        const dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
        return R.over(
          STATE_LENS,
          pointModel.shiftUp$(dist),
          model
        );
      }
      function modelShiftDown(_factions_, small, model) {
        const dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
        return R.over(
          STATE_LENS,
          pointModel.shiftDown$(dist),
          model
        );
      }
    };
  }
})();
