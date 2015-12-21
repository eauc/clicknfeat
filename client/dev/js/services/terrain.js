'use strict';

angular.module('clickApp.services').factory('terrain', ['settings', 'point', function terrainServiceFactory(settingsService, pointService) {
  var DEFAULT_MOVES = {
    Move: 10,
    MoveSmall: 1,
    Rotate: 15,
    RotateSmall: 5,
    Shift: 10,
    ShiftSmall: 1
  };
  var MOVES = R.clone(DEFAULT_MOVES);
  settingsService.register('Moves', 'Terrain', DEFAULT_MOVES, function (moves) {
    R.extend(MOVES, moves);
  });
  var terrainService = {
    create: function terrainCreate(temp) {
      var terrain = {
        state: {
          x: 0, y: 0, r: 0,
          lk: false,
          stamp: R.guid()
        }
      };
      terrain.state = R.deepExtend(terrain.state, temp);
      return terrainService.checkState(terrain);
    },
    stamp: function terrainStamp(terrain) {
      return R.path(['state', 'stamp'], terrain);
    },
    eventName: function terrainEventName(terrain) {
      return R.path(['state', 'stamp'], terrain);
    },
    state: function terrainState(terrain) {
      return R.prop('state', terrain);
    },
    saveState: function terrainSaveState(terrain) {
      return R.clone(R.prop('state', terrain));
    },
    setState: function terrainSetState(state, terrain) {
      terrain.state = R.clone(state);
    },
    checkState: function terrainCheckState(terrain) {
      terrain.state = R.pipe(R.assoc('x', Math.max(0, Math.min(480, terrain.state.x))), R.assoc('y', Math.max(0, Math.min(480, terrain.state.y))))(terrain.state);
      return terrain;
    },
    isLocked: function terrainIsLocked(terrain) {
      return R.path(['state', 'lk'], terrain);
    },
    setLock: function terrainSetLock(set, terrain) {
      terrain.state = R.assoc('lk', set, terrain.state);
      return terrain;
    },
    setPosition: function terrainSet(pos, terrain) {
      if (terrainService.isLocked(terrain)) {
        return self.Promise.reject('Terrain is locked');
      }

      terrain.state = R.pipe(R.assoc('x', pos.x), R.assoc('y', pos.y))(terrain.state);
      return terrainService.checkState(terrain);
    },
    shiftPosition: function terrainSet(shift, terrain) {
      if (terrainService.isLocked(terrain)) {
        return self.Promise.reject('Terrain is locked');
      }

      terrain.state = R.pipe(R.assoc('x', terrain.state.x + shift.x), R.assoc('y', terrain.state.y + shift.y))(terrain.state);
      return terrainService.checkState(terrain);
    },
    setOrientation: function terrainSet(orientation, terrain) {
      if (terrainService.isLocked(terrain)) {
        return self.Promise.reject('Terrain is locked');
      }

      terrain.state = R.assoc('r', orientation, terrain.state);
      return terrainService.checkState(terrain);
    },
    moveFront: function terrainMoveFront(small, terrain) {
      if (terrainService.isLocked(terrain)) {
        return self.Promise.reject('Terrain is locked');
      }

      var dist = MOVES[small ? 'MoveSmall' : 'Move'];
      terrain.state = pointService.moveFront(dist, terrain.state);
      return terrainService.checkState(terrain);
    },
    moveBack: function terrainMoveBack(small, terrain) {
      if (terrainService.isLocked(terrain)) {
        return self.Promise.reject('Terrain is locked');
      }

      var dist = MOVES[small ? 'MoveSmall' : 'Move'];
      terrain.state = pointService.moveBack(dist, terrain.state);
      return terrainService.checkState(terrain);
    },
    rotateLeft: function terrainRotateLeft(small, terrain) {
      if (terrainService.isLocked(terrain)) {
        return self.Promise.reject('Terrain is locked');
      }

      var angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
      terrain.state = pointService.rotateLeft(angle, terrain.state);
      return terrainService.checkState(terrain);
    },
    rotateRight: function terrainRotateRight(small, terrain) {
      if (terrainService.isLocked(terrain)) {
        return self.Promise.reject('Terrain is locked');
      }

      var angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
      terrain.state = pointService.rotateRight(angle, terrain.state);
      return terrainService.checkState(terrain);
    },
    shiftLeft: function terrainShiftLeft(small, terrain) {
      if (terrainService.isLocked(terrain)) {
        return self.Promise.reject('Terrain is locked');
      }

      var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
      terrain.state = pointService.shiftLeft(dist, terrain.state);
      return terrainService.checkState(terrain);
    },
    shiftRight: function terrainShiftRight(small, terrain) {
      if (terrainService.isLocked(terrain)) {
        return self.Promise.reject('Terrain is locked');
      }

      var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
      terrain.state = pointService.shiftRight(dist, terrain.state);
      return terrainService.checkState(terrain);
    },
    shiftUp: function terrainShiftUp(small, terrain) {
      if (terrainService.isLocked(terrain)) {
        return self.Promise.reject('Terrain is locked');
      }

      var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
      terrain.state = pointService.shiftUp(dist, terrain.state);
      return terrainService.checkState(terrain);
    },
    shiftDown: function terrainShiftDown(small, terrain) {
      if (terrainService.isLocked(terrain)) {
        return self.Promise.reject('Terrain is locked');
      }

      var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
      terrain.state = pointService.shiftDown(dist, terrain.state);
      return terrainService.checkState(terrain);
    }
  };
  R.curryService(terrainService);
  return terrainService;
}]);
//# sourceMappingURL=terrain.js.map
