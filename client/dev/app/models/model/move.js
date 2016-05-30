'use strict';

(function () {
  angular.module('clickApp.services').factory('modelMove', modelMoveModelFactory);

  modelMoveModelFactory.$inject = ['point'];
  function modelMoveModelFactory(pointModel) {
    var STATE_LENS = R.lensProp('state');
    var X_LENS = R.lensPath(['state', 'x']);
    var Y_LENS = R.lensPath(['state', 'y']);
    return function (MOVES, modelModel) {
      var modelMoveModel = {
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
        return function () {
          var _this = this;

          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          var model = R.last(args);
          var target = withTarget ? R.head(args) : null;
          return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function () {
            return move.apply(_this, args);
          }, modelModel.checkState$(target));
        };
      }
      function modelSetPosition(_target_, pos, model) {
        return R.pipe(R.set(X_LENS, pos.x), R.set(Y_LENS, pos.y))(model);
      }
      function modelSetPositionP_(target, pos, model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), R.set(X_LENS, pos.x), R.set(Y_LENS, pos.y), modelModel.checkState$(target), function (check) {
          model.state = check.state;
          return model;
        });
      }
      function modelShiftPosition(_target_, shift, model) {
        return R.pipe(R.over(X_LENS, R.add(shift.x)), R.over(Y_LENS, R.add(shift.y)))(model);
      }
      function modelSetOrientation(orientation, model) {
        return R.assocPath(['state', 'r'], orientation, model);
      }
      function modelOrientTo(other, model) {
        return R.assocPath(['state', 'r'], pointModel.directionTo(other.state, model.state), model);
      }
      function modelMoveFront(small, model) {
        var dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.over(STATE_LENS, pointModel.moveFront$(dist), model);
      }
      function modelMoveBack(small, model) {
        var dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.over(STATE_LENS, pointModel.moveBack$(dist), model);
      }
      function modelRotateLeft(small, model) {
        var angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
        return R.over(STATE_LENS, pointModel.rotateLeft$(angle), model);
      }
      function modelRotateRight(small, model) {
        var angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
        return R.over(STATE_LENS, pointModel.rotateRight$(angle), model);
      }
      function modelShiftLeft(small, model) {
        var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
        return R.over(STATE_LENS, pointModel.shiftLeft$(dist), model);
      }
      function modelShiftRight(small, model) {
        var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
        return R.over(STATE_LENS, pointModel.shiftRight$(dist), model);
      }
      function modelShiftUp(small, model) {
        var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
        return R.over(STATE_LENS, pointModel.shiftUp$(dist), model);
      }
      function modelShiftDown(small, model) {
        var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
        return R.over(STATE_LENS, pointModel.shiftDown$(dist), model);
      }
    };
  }
})();
//# sourceMappingURL=move.js.map
