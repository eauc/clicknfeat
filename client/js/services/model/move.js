'use strict';

angular.module('clickApp.services')
  .factory('modelMove', [
    'settings',
    'point',
    'gameFactions',
    function modelMoveServiceFactory(settingsService,
                                     pointService,
                                     gameFactionsService) {
      return function(MOVES, modelService) {
        var modelMoveService = {
          setPosition: function modelSet(factions, pos, model) {
            if(modelService.isLocked(model)) {
              return self.Promise.reject('Model '+model.state.stamp+' is locked');
            }
            
            model.state = R.pipe(
              R.assoc('x', pos.x),
              R.assoc('y', pos.y)
            )(model.state);
            return modelService.checkState(factions, null, model);
          },
          shiftPosition: function modelSet(factions, shift, model) {
            if(modelService.isLocked(model)) {
              return self.Promise.reject('Model '+model.state.stamp+' is locked');
            }

            model.state = R.pipe(
              R.assoc('x', model.state.x + shift.x),
              R.assoc('y', model.state.y + shift.y)
            )(model.state);
            return modelService.checkState(factions, null, model);
          },
          setOrientation: function modelSet(factions, orientation, model) {
            if(modelService.isLocked(model)) {
              return self.Promise.reject('Model '+model.state.stamp+' is locked');
            }

            model.state = R.assoc('r', orientation, model.state);
            return modelService.checkState(factions, null, model);
          },
          orientTo: function modelSet(factions, other, model) {
            if(modelService.isLocked(model)) {
              return self.Promise.reject('Model '+model.state.stamp+' is locked');
            }

            model.state = R.assoc('r', pointService.directionTo(other.state, model.state), model.state);
            return modelService.checkState(factions, null, model);
          },
          moveFront: function modelMoveFront(factions, small, model) {
            if(modelService.isLocked(model)) {
              return self.Promise.reject('Model '+model.state.stamp+' is locked');
            }

            var dist = MOVES[small ? 'MoveSmall' : 'Move'];
            model.state = pointService.moveFront(dist, model.state);
            return modelService.checkState(factions, null, model);
          },
          moveBack: function modelMoveBack(factions, small, model) {
            if(modelService.isLocked(model)) {
              return self.Promise.reject('Model '+model.state.stamp+' is locked');
            }

            var dist = MOVES[small ? 'MoveSmall' : 'Move'];
            model.state = pointService.moveBack(dist, model.state);
            return modelService.checkState(factions, null, model);
          },
          rotateLeft: function modelRotateLeft(factions, small, model) {
            if(modelService.isLocked(model)) {
              return self.Promise.reject('Model '+model.state.stamp+' is locked');
            }

            var angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
            model.state = pointService.rotateLeft(angle, model.state);
            return modelService.checkState(factions, null, model);
          },
          rotateRight: function modelRotateRight(factions, small, model) {
            if(modelService.isLocked(model)) {
              return self.Promise.reject('Model '+model.state.stamp+' is locked');
            }

            var angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
            model.state = pointService.rotateRight(angle, model.state);
            return modelService.checkState(factions, null, model);
          },
          shiftLeft: function modelShiftLeft(factions, small, model) {
            if(modelService.isLocked(model)) {
              return self.Promise.reject('Model '+model.state.stamp+' is locked');
            }

            var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
            model.state = pointService.shiftLeft(dist, model.state);
            return modelService.checkState(factions, null, model);
          },
          shiftRight: function modelShiftRight(factions, small, model) {
            if(modelService.isLocked(model)) {
              return self.Promise.reject('Model '+model.state.stamp+' is locked');
            }

            var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
            model.state = pointService.shiftRight(dist, model.state);
            return modelService.checkState(factions, null, model);
          },
          shiftUp: function modelShiftUp(factions, small, model) {
            if(modelService.isLocked(model)) {
              return self.Promise.reject('Model '+model.state.stamp+' is locked');
            }

            var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
            model.state = pointService.shiftUp(dist, model.state);
            return modelService.checkState(factions, null, model);
          },
          shiftDown: function modelShiftDown(factions, small, model) {
            if(modelService.isLocked(model)) {
              return self.Promise.reject('Model '+model.state.stamp+' is locked');
            }

            var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
            model.state = pointService.shiftDown(dist, model.state);
            return modelService.checkState(factions, null, model);
          },
        };
        return modelMoveService;
      };
    }
  ]);
