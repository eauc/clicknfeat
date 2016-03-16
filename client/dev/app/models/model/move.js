'use strict';

(function () {
  angular.module('clickApp.services').factory('modelMove', modelMoveModelFactory);

  modelMoveModelFactory.$inject = ['point'];
  function modelMoveModelFactory(pointModel) {
    return function (MOVES, modelModel) {
      var modelMoveModel = {
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
        return function () {
          var _this = this;

          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          var model = R.last(args);
          var factions = R.head(args);
          var target = withTarget ? R.nth(1, args) : null;
          return R.threadP(model)(R.rejectIf(modelModel.isLocked, 'Model is locked'), function () {
            return move.apply(_this, args);
          }, modelModel.checkStateP$(factions, target));
        };
      }
      function modelSetPositionP(_factions_, _target_, pos, model) {
        return R.pipe(R.assocPath(['state', 'x'], pos.x), R.assocPath(['state', 'y'], pos.y))(model);
      }
      function modelSetPosition_(factions, target, pos, model) {
        return R.threadP(model)(R.rejectIf(modelModel.isLocked, 'Model is locked'), R.assocPath(['state', 'x'], pos.x), R.assocPath(['state', 'y'], pos.y), modelModel.checkStateP$(factions, target), function (check) {
          model.state = check.state;
          return model;
        });
      }
      function modelShiftPositionP(_factions_, _target_, shift, model) {
        return R.pipe(R.over(R.lensPath(['state', 'x']), R.add(shift.x)), R.over(R.lensPath(['state', 'y']), R.add(shift.y)))(model);
      }
      function modelSetOrientationP(_factions_, orientation, model) {
        return R.assocPath(['state', 'r'], orientation, model);
      }
      function modelOrientToP(_factions_, other, model) {
        return R.assocPath(['state', 'r'], pointModel.directionTo(other.state, model.state), model);
      }
      function modelMoveFrontP(_factions_, small, model) {
        var dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.over(R.lensProp('state'), pointModel.moveFront$(dist), model);
      }
      function modelMoveBackP(_factions_, small, model) {
        var dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.over(R.lensProp('state'), pointModel.moveBack$(dist), model);
      }
      function modelRotateLeftP(_factions_, small, model) {
        var angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
        return R.over(R.lensProp('state'), pointModel.rotateLeft$(angle), model);
      }
      function modelRotateRightP(_factions_, small, model) {
        var angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
        return R.over(R.lensProp('state'), pointModel.rotateRight$(angle), model);
      }
      function modelShiftLeftP(_factions_, small, model) {
        var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
        return R.over(R.lensProp('state'), pointModel.shiftLeft$(dist), model);
      }
      function modelShiftRightP(_factions_, small, model) {
        var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
        return R.over(R.lensProp('state'), pointModel.shiftRight$(dist), model);
      }
      function modelShiftUpP(_factions_, small, model) {
        var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
        return R.over(R.lensProp('state'), pointModel.shiftUp$(dist), model);
      }
      function modelShiftDownP(_factions_, small, model) {
        var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
        return R.over(R.lensProp('state'), pointModel.shiftDown$(dist), model);
      }
    };
  }
})();
//# sourceMappingURL=move.js.map
