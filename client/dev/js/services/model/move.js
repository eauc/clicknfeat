'use strict';

angular.module('clickApp.services').factory('modelMove', ['settings', 'point', function modelMoveServiceFactory(settingsService, pointService) {
  return function (MOVES, modelService) {
    var modelMoveService = {
      setPosition: function modelSetPosition(factions, target, pos, model) {
        if (modelService.isLocked(model)) {
          return self.Promise.reject('Model is locked');
        }

        model = R.pipe(R.assocPath(['state', 'x'], pos.x), R.assocPath(['state', 'y'], pos.y))(model);
        return modelService.checkState(factions, target, model);
      },
      setPosition_: function modelSetPosition(factions, target, pos, model) {
        if (modelService.isLocked(model)) {
          return self.Promise.reject('Model is locked');
        }

        model.state = R.pipe(R.assoc('x', pos.x), R.assoc('y', pos.y))(model.state);
        return R.pipePromise(function () {
          return modelService.checkState(factions, target, model);
        }, function (check) {
          model.state = check.state;
          return model;
        })();
      },
      shiftPosition: function modelSet(factions, target, shift, model) {
        if (modelService.isLocked(model)) {
          return self.Promise.reject('Model is locked');
        }

        model = R.pipe(R.over(R.lensPath(['state', 'x']), R.add(shift.x)), R.over(R.lensPath(['state', 'y']), R.add(shift.y)))(model);
        return modelService.checkState(factions, target, model);
      },
      setOrientation: function modelSet(factions, orientation, model) {
        if (modelService.isLocked(model)) {
          return self.Promise.reject('Model is locked');
        }

        model = R.assocPath(['state', 'r'], orientation, model);
        return modelService.checkState(factions, null, model);
      },
      orientTo: function modelSet(factions, other, model) {
        if (modelService.isLocked(model)) {
          return self.Promise.reject('Model is locked');
        }

        model = R.assocPath(['state', 'r'], pointService.directionTo(other.state, model.state), model);
        return modelService.checkState(factions, null, model);
      },
      moveFront: function modelMoveFront(factions, small, model) {
        if (modelService.isLocked(model)) {
          return self.Promise.reject('Model is locked');
        }

        var dist = MOVES[small ? 'MoveSmall' : 'Move'];
        model = R.over(R.lensProp('state'), pointService.moveFront$(dist), model);
        return modelService.checkState(factions, null, model);
      },
      moveBack: function modelMoveBack(factions, small, model) {
        if (modelService.isLocked(model)) {
          return self.Promise.reject('Model is locked');
        }

        var dist = MOVES[small ? 'MoveSmall' : 'Move'];
        model = R.over(R.lensProp('state'), pointService.moveBack$(dist), model);
        return modelService.checkState(factions, null, model);
      },
      rotateLeft: function modelRotateLeft(factions, small, model) {
        if (modelService.isLocked(model)) {
          return self.Promise.reject('Model is locked');
        }

        var angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
        model = R.over(R.lensProp('state'), pointService.rotateLeft$(angle), model);
        return modelService.checkState(factions, null, model);
      },
      rotateRight: function modelRotateRight(factions, small, model) {
        if (modelService.isLocked(model)) {
          return self.Promise.reject('Model is locked');
        }

        var angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
        model = R.over(R.lensProp('state'), pointService.rotateRight$(angle), model);
        return modelService.checkState(factions, null, model);
      },
      shiftLeft: function modelShiftLeft(factions, small, model) {
        if (modelService.isLocked(model)) {
          return self.Promise.reject('Model is locked');
        }

        var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
        model = R.over(R.lensProp('state'), pointService.shiftLeft$(dist), model);
        return modelService.checkState(factions, null, model);
      },
      shiftRight: function modelShiftRight(factions, small, model) {
        if (modelService.isLocked(model)) {
          return self.Promise.reject('Model is locked');
        }

        var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
        model = R.over(R.lensProp('state'), pointService.shiftRight$(dist), model);
        return modelService.checkState(factions, null, model);
      },
      shiftUp: function modelShiftUp(factions, small, model) {
        if (modelService.isLocked(model)) {
          return self.Promise.reject('Model is locked');
        }

        var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
        model = R.over(R.lensProp('state'), pointService.shiftUp$(dist), model);
        return modelService.checkState(factions, null, model);
      },
      shiftDown: function modelShiftDown(factions, small, model) {
        if (modelService.isLocked(model)) {
          return self.Promise.reject('Model is locked');
        }

        var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
        model = R.over(R.lensProp('state'), pointService.shiftDown$(dist), model);
        return modelService.checkState(factions, null, model);
      }
    };
    return modelMoveService;
  };
}]);
//# sourceMappingURL=move.js.map
