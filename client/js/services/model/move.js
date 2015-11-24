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
            if(modelService.isLocked(model)) return;
            model.state = R.pipe(
              R.assoc('x', pos.x),
              R.assoc('y', pos.y),
              modelService.checkState$(factions, null)
            )(model.state);
          },
          setOrientation: function modelSet(factions, orientation, model) {
            if(modelService.isLocked(model)) return;
            model.state = R.pipe(
              R.assoc('r', orientation),
              modelService.checkState$(factions, null)
            )(model.state);
          },
          orientTo: function modelSet(factions, other, model) {
            if(modelService.isLocked(model)) return;
            model.state = R.pipe(
              R.assoc('r', pointService.directionTo(other.state, model.state)),
              modelService.checkState$(factions, null)
            )(model.state);
          },
          shiftPosition: function modelSet(factions, shift, model) {
            if(modelService.isLocked(model)) return;
            model.state = R.pipe(
              R.assoc('x', model.state.x + shift.x),
              R.assoc('y', model.state.y + shift.y),
              modelService.checkState$(factions, null)
            )(model.state);
          },
          moveFront: function modelMoveFront(factions, small, model) {
            if(modelService.isLocked(model)) return;
            var dist = MOVES[small ? 'MoveSmall' : 'Move'];
            model.state = R.pipe(
              pointService.moveFront$(dist),
              modelService.checkState$(factions, null)
            )(model.state);
          },
          moveBack: function modelMoveBack(factions, small, model) {
            if(modelService.isLocked(model)) return;
            var dist = MOVES[small ? 'MoveSmall' : 'Move'];
            model.state = R.pipe(
              pointService.moveBack$(dist),
              modelService.checkState$(factions, null)
            )(model.state);
          },
          rotateLeft: function modelRotateLeft(factions, small, model) {
            if(modelService.isLocked(model)) return;
            var angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
            model.state = R.pipe(
              pointService.rotateLeft$(angle),
              modelService.checkState$(factions, null)
            )(model.state);
          },
          rotateRight: function modelRotateRight(factions, small, model) {
            if(modelService.isLocked(model)) return;
            var angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
            model.state = R.pipe(
              pointService.rotateRight$(angle),
              modelService.checkState$(factions, null)
            )(model.state);
          },
          shiftLeft: function modelShiftLeft(factions, small, model) {
            if(modelService.isLocked(model)) return;
            var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
            model.state = R.pipe(
              pointService.shiftLeft$(dist),
              modelService.checkState$(factions, null)
            )(model.state);
          },
          shiftRight: function modelShiftRight(factions, small, model) {
            if(modelService.isLocked(model)) return;
            var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
            model.state = R.pipe(
              pointService.shiftRight$(dist),
              modelService.checkState$(factions, null)
            )(model.state);
          },
          shiftUp: function modelShiftUp(factions, small, model) {
            if(modelService.isLocked(model)) return;
            var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
            model.state = R.pipe(
              pointService.shiftUp$(dist),
              modelService.checkState$(factions, null)
            )(model.state);
          },
          shiftDown: function modelShiftDown(factions, small, model) {
            if(modelService.isLocked(model)) return;
            var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
            model.state = R.pipe(
              pointService.shiftDown$(dist),
              modelService.checkState$(factions, null)
            )(model.state);
          },
        };
        return modelMoveService;
      };
    }
  ]);
