'use strict';

(function () {
  angular.module('clickApp.services').factory('terrain', terrainModelFactory);

  terrainModelFactory.$inject = ['settings', 'point'];
  function terrainModelFactory(settingsModel, pointModel) {
    var terrainModel = {
      create: terrainCreate,
      stamp: terrainStamp,
      eventName: terrainEventName,
      state: terrainState,
      saveState: terrainSaveState,
      setState: terrainSetState,
      checkState: terrainCheckState,
      isLocked: terrainIsLocked,
      setLock: terrainSetLock,
      setPositionP: terrainSetPositionP,
      shiftPositionP: terrainShiftPositionP,
      setOrientationP: terrainSetOrientationP,
      moveFrontP: terrainMoveFrontP,
      moveBackP: terrainMoveBackP,
      rotateLeftP: terrainRotateLeftP,
      rotateRightP: terrainRotateRightP,
      shiftLeftP: terrainShiftLeftP,
      shiftRightP: terrainShiftRightP,
      shiftUpP: terrainShiftUpP,
      shiftDownP: terrainShiftDownP
    };

    var DEFAULT_MOVES = {
      Move: 10,
      MoveSmall: 1,
      Rotate: 15,
      RotateSmall: 5,
      Shift: 10,
      ShiftSmall: 1
    };
    var MOVES = R.clone(DEFAULT_MOVES);
    settingsModel.register('Misc', 'Terrain', DEFAULT_MOVES, function (moves) {
      R.extend(MOVES, moves);
    });
    R.curryService(terrainModel);
    return terrainModel;

    function terrainCreate(temp) {
      var terrain = {
        state: {
          x: 0, y: 0, r: 0,
          lk: false,
          stamp: R.guid()
        }
      };
      terrain.state = R.deepExtend(terrain.state, temp);
      return terrainModel.checkState(terrain);
    }
    function terrainStamp(terrain) {
      return R.path(['state', 'stamp'], terrain);
    }
    function terrainEventName(terrain) {
      return R.path(['state', 'stamp'], terrain);
    }
    function terrainState(terrain) {
      return R.prop('state', terrain);
    }
    function terrainSaveState(terrain) {
      return R.clone(R.prop('state', terrain));
    }
    function terrainSetState(state, terrain) {
      return R.assoc('state', R.clone(state), terrain);
    }
    function terrainCheckState(terrain) {
      return R.thread(terrain)(R.over(R.lensPath(['state', 'x']), R.compose(R.max(0), R.min(480))), R.over(R.lensPath(['state', 'y']), R.compose(R.max(0), R.min(480))));
    }
    function terrainIsLocked(terrain) {
      return R.path(['state', 'lk'], terrain);
    }
    function terrainSetLock(set, terrain) {
      return R.assocPath(['state', 'lk'], set, terrain);
    }
    function terrainSetPositionP(pos, terrain) {
      return R.threadP(terrain)(R.rejectIf(terrainModel.isLocked, 'Terrain is locked'), R.assocPath(['state', 'x'], pos.x), R.assocPath(['state', 'y'], pos.y), terrainModel.checkState);
    }
    function terrainShiftPositionP(shift, terrain) {
      return R.threadP(terrain)(R.rejectIf(terrainModel.isLocked, 'Terrain is locked'), R.assocPath(['state', 'x'], terrain.state.x + shift.x), R.assocPath(['state', 'y'], terrain.state.y + shift.y), terrainModel.checkState);
    }
    function terrainSetOrientationP(orientation, terrain) {
      return R.threadP(terrain)(R.rejectIf(terrainModel.isLocked, 'Terrain is locked'), R.assocPath(['state', 'r'], orientation, terrain), terrainModel.checkState);
    }
    function terrainMoveFrontP(small, terrain) {
      var dist = MOVES[small ? 'MoveSmall' : 'Move'];
      return R.threadP(terrain)(R.rejectIf(terrainModel.isLocked, 'Terrain is locked'), R.over(R.lensProp('state'), pointModel.moveFront$(dist)), terrainModel.checkState);
    }
    function terrainMoveBackP(small, terrain) {
      var dist = MOVES[small ? 'MoveSmall' : 'Move'];
      return R.threadP(terrain)(R.rejectIf(terrainModel.isLocked, 'Terrain is locked'), R.over(R.lensProp('state'), pointModel.moveBack$(dist)), terrainModel.checkState);
    }
    function terrainRotateLeftP(small, terrain) {
      var angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
      return R.threadP(terrain)(R.rejectIf(terrainModel.isLocked, 'Terrain is locked'), R.over(R.lensProp('state'), pointModel.rotateLeft$(angle)), terrainModel.checkState);
    }
    function terrainRotateRightP(small, terrain) {
      var angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
      return R.threadP(terrain)(R.rejectIf(terrainModel.isLocked, 'Terrain is locked'), R.over(R.lensProp('state'), pointModel.rotateRight$(angle)), terrainModel.checkState);
    }
    function terrainShiftLeftP(small, terrain) {
      var dist = MOVES[small ? 'MoveSmall' : 'Move'];
      return R.threadP(terrain)(R.rejectIf(terrainModel.isLocked, 'Terrain is locked'), R.over(R.lensProp('state'), pointModel.shiftLeft$(dist)), terrainModel.checkState);
    }
    function terrainShiftRightP(small, terrain) {
      var dist = MOVES[small ? 'MoveSmall' : 'Move'];
      return R.threadP(terrain)(R.rejectIf(terrainModel.isLocked, 'Terrain is locked'), R.over(R.lensProp('state'), pointModel.shiftRight$(dist)), terrainModel.checkState);
    }
    function terrainShiftUpP(small, terrain) {
      var dist = MOVES[small ? 'MoveSmall' : 'Move'];
      return R.threadP(terrain)(R.rejectIf(terrainModel.isLocked, 'Terrain is locked'), R.over(R.lensProp('state'), pointModel.shiftUp$(dist)), terrainModel.checkState);
    }
    function terrainShiftDownP(small, terrain) {
      var dist = MOVES[small ? 'MoveSmall' : 'Move'];
      return R.threadP(terrain)(R.rejectIf(terrainModel.isLocked, 'Terrain is locked'), R.over(R.lensProp('state'), pointModel.shiftDown$(dist)), terrainModel.checkState);
    }
  }
})();
//# sourceMappingURL=terrain.js.map
