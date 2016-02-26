'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function () {
  angular.module('clickApp.services').factory('element', elementModelFactory);

  elementModelFactory.$inject = ['point'];
  function elementModelFactory(pointModel) {
    return function buildElementModel(type, MOVES) {
      var elementModel = {
        create: elementCreate,
        stamp: elementStamp,
        eventName: elementEventName,
        state: elementState,
        saveState: elementSaveState,
        setState: elementSetState,
        checkState: elementCheckState,
        isLocked: elementIsLocked,
        setLock: elementSetLock,
        setPositionP: moveElementP(elementSetPosition),
        shiftPositionP: moveElementP(elementShiftPosition),
        setOrientationP: moveElementP(elementSetOrientation),
        moveFrontP: moveElementP(elementMoveFront),
        moveBackP: moveElementP(elementMoveBack),
        rotateLeftP: moveElementP(elementRotateLeft),
        rotateRightP: moveElementP(elementRotateRight),
        shiftLeftP: moveElementP(elementShiftLeft),
        shiftRightP: moveElementP(elementShiftRight),
        shiftUpP: moveElementP(elementShiftUp),
        shiftDownP: moveElementP(elementShiftDown)
      };

      R.curryService(elementModel);
      return elementModel;

      function elementCreate(temp) {
        var element = {
          state: {
            x: 0, y: 0, r: 0,
            lk: false,
            stamp: R.guid()
          }
        };
        element.state = R.deepExtend(element.state, temp);
        return elementModel.checkState(element);
      }
      function elementStamp(element) {
        return R.path(['state', 'stamp'], element);
      }
      function elementEventName(element) {
        return R.path(['state', 'stamp'], element);
      }
      function elementState(element) {
        return R.prop('state', element);
      }
      function elementSaveState(element) {
        return R.clone(R.prop('state', element));
      }
      function elementSetState(state, element) {
        return R.assoc('state', R.clone(state), element);
      }
      function elementCheckState(element) {
        return R.thread(element)(R.over(R.lensPath(['state', 'x']), R.compose(R.max(0), R.min(480))), R.over(R.lensPath(['state', 'y']), R.compose(R.max(0), R.min(480))));
      }
      function elementIsLocked(element) {
        return R.path(['state', 'lk'], element);
      }
      function elementSetLock(set, element) {
        return R.assocPath(['state', 'lk'], set, element);
      }
      function moveElementP(move) {
        return function () {
          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          var element = R.last(args);
          var params = R.init(args);
          return R.threadP(element)(R.rejectIf(elementModel.isLocked, s.capitalize(type) + ' is locked'), function (element) {
            return move.apply(null, [].concat(_toConsumableArray(params), [element]));
          }, elementModel.checkState);
        };
      }
      function elementSetPosition(pos, element) {
        return R.thread(element)(R.assocPath(['state', 'x'], pos.x), R.assocPath(['state', 'y'], pos.y));
      }
      function elementShiftPosition(shift, element) {
        return R.threadP(element)(R.assocPath(['state', 'x'], element.state.x + shift.x), R.assocPath(['state', 'y'], element.state.y + shift.y));
      }
      function elementSetOrientation(orientation, element) {
        return R.threadP(element)(R.assocPath(['state', 'r'], orientation));
      }
      function elementMoveFront(small, element) {
        var dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.threadP(element)(R.over(R.lensProp('state'), pointModel.moveFront$(dist)));
      }
      function elementMoveBack(small, element) {
        var dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.threadP(element)(R.over(R.lensProp('state'), pointModel.moveBack$(dist)));
      }
      function elementRotateLeft(small, element) {
        var angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
        return R.threadP(element)(R.over(R.lensProp('state'), pointModel.rotateLeft$(angle)));
      }
      function elementRotateRight(small, element) {
        var angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
        return R.threadP(element)(R.over(R.lensProp('state'), pointModel.rotateRight$(angle)));
      }
      function elementShiftLeft(small, element) {
        var dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.threadP(element)(R.over(R.lensProp('state'), pointModel.shiftLeft$(dist)));
      }
      function elementShiftRight(small, element) {
        var dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.threadP(element)(R.over(R.lensProp('state'), pointModel.shiftRight$(dist)));
      }
      function elementShiftUp(small, element) {
        var dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.threadP(element)(R.over(R.lensProp('state'), pointModel.shiftUp$(dist)));
      }
      function elementShiftDown(small, element) {
        var dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.threadP(element)(R.over(R.lensProp('state'), pointModel.shiftDown$(dist)));
      }
    };
  }
})();
//# sourceMappingURL=element.js.map
