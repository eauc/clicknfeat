'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function () {
  angular.module('clickApp.services').factory('element', elementModelFactory);

  elementModelFactory.$inject = ['point'];
  function elementModelFactory(pointModel) {
    var STATE_LENS = R.lensProp('state');
    var STAMP_LENS = R.lensPath(['state', 'stamp']);
    var LOCK_LENS = R.lensPath(['state', 'lk']);
    var LABEL_LENS = R.lensPath(['state', 'l']);
    var X_LENS = R.lensPath(['state', 'x']);
    var Y_LENS = R.lensPath(['state', 'y']);
    var R_LENS = R.lensPath(['state', 'y']);
    var saturateXY = R.compose(R.max(0), R.min(480));
    return function buildElementModel(type, MOVES) {
      var elementModel = {
        createDefault: elementCreateDefault,
        create: elementCreate,
        stamp: elementStamp,
        state: elementState,
        saveState: elementSaveState,
        setState: elementSetState,
        checkState: elementCheckState,
        isLocked: elementIsLocked,
        setLock: elementSetLock,
        addLabel: elementAddLabel,
        removeLabel: elementRemoveLabel,
        fullLabel: elementFullLabel,
        clearLabel: elementClearLabel,
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
        shiftDownP: moveElementP(elementShiftDown),
        renderLabel: elementRenderLabel,
        renderText: elementRenderText
      };

      R.curryService(elementModel);
      return elementModel;

      function elementCreateDefault() {
        return {
          state: {
            x: 0, y: 0, r: 0,
            l: [],
            lk: false,
            stamp: R.guid()
          }
        };
      }
      function elementCreate(temp) {
        return R.thread(temp)(this.createDefault, R.tap(function (element) {
          R.deepExtend(element.state, temp);
        }), this.checkState);
      }
      function elementStamp(element) {
        return R.set(STAMP_LENS, element);
      }
      function elementState(element) {
        return R.view(STATE_LENS, element);
      }
      function elementSaveState(element) {
        return R.clone(R.view(STATE_LENS, element));
      }
      function elementSetState(state, element) {
        return R.set(STATE_LENS, R.clone(state), element);
      }
      function elementCheckState(element) {
        return R.thread(element)(R.over(X_LENS, saturateXY), R.over(Y_LENS, saturateXY));
      }
      function elementIsLocked(element) {
        return R.view(LOCK_LENS, element);
      }
      function elementSetLock(set, element) {
        return R.set(LOCK_LENS, set, element);
      }
      function moveElementP(move) {
        return function () {
          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          var element = R.last(args);
          var params = R.init(args);
          return R.threadP(element)(R.rejectIfP(this.isLocked, s.capitalize(type) + ' is locked'), function (element) {
            return move.apply(undefined, _toConsumableArray(params).concat([element]));
          }, this.checkState);
        };
      }
      function elementSetPosition(pos, element) {
        return R.thread(element)(R.set(X_LENS, pos.x), R.set(Y_LENS, pos.y));
      }
      function elementShiftPosition(shift, element) {
        return R.thread(element)(R.set(X_LENS, element.state.x + shift.x), R.set(Y_LENS, element.state.y + shift.y));
      }
      function elementSetOrientation(orientation, element) {
        return R.set(R_LENS, orientation, element);
      }
      function elementMoveFront(small, element) {
        var dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.over(STATE_LENS, pointModel.moveFront$(dist), element);
      }
      function elementMoveBack(small, element) {
        var dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.over(STATE_LENS, pointModel.moveBack$(dist), element);
      }
      function elementRotateLeft(small, element) {
        var angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
        return R.over(STATE_LENS, pointModel.rotateLeft$(angle), element);
      }
      function elementRotateRight(small, element) {
        var angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
        return R.over(STATE_LENS, pointModel.rotateRight$(angle), element);
      }
      function elementShiftLeft(small, element) {
        var dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.over(STATE_LENS, pointModel.shiftLeft$(dist), element);
      }
      function elementShiftRight(small, element) {
        var dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.over(STATE_LENS, pointModel.shiftRight$(dist), element);
      }
      function elementShiftUp(small, element) {
        var dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.over(STATE_LENS, pointModel.shiftUp$(dist), element);
      }
      function elementShiftDown(small, element) {
        var dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.over(STATE_LENS, pointModel.shiftDown$(dist), element);
      }
      function elementAddLabel(label, element) {
        return R.over(LABEL_LENS, R.compose(R.uniq, R.append(label)), element);
      }
      function elementRemoveLabel(label, element) {
        return R.over(LABEL_LENS, R.reject(R.equals(label)), element);
      }
      function elementClearLabel(element) {
        return R.set(LABEL_LENS, [], element);
      }
      function elementFullLabel(element) {
        return R.viewOr([], LABEL_LENS, element).join(' ');
      }
      function elementRenderLabel(_ref, element_state) {
        var _ref$rotate_with_mode = _ref.rotate_with_model;
        var rotate_with_model = _ref$rotate_with_mode === undefined ? false : _ref$rotate_with_mode;
        var _ref$flipped = _ref.flipped;
        var flipped = _ref$flipped === undefined ? false : _ref$flipped;
        var _ref$flip_center = _ref.flip_center;
        var flip_center = _ref$flip_center === undefined ? { x: 240, y: 240 } : _ref$flip_center;
        var _ref$text_center = _ref.text_center;
        var text_center = _ref$text_center === undefined ? { x: 240, y: 240 } : _ref$text_center;

        var text = R.propOr([], 'l', element_state).join(' ');
        var show = R.length(text) > 0 ? true : false;
        var rotate = rotate_with_model ? element_state.r : 0;
        var label = elementModel.renderText({
          rotate: rotate, flipped: flipped, flip_center: flip_center, text_center: text_center
        }, text);
        label.show = show;
        return label;
      }
      function elementRenderText(_ref2, text) {
        var _ref2$rotate = _ref2.rotate;
        var rotate = _ref2$rotate === undefined ? 0 : _ref2$rotate;
        var _ref2$flipped = _ref2.flipped;
        var flipped = _ref2$flipped === undefined ? false : _ref2$flipped;
        var _ref2$flip_center = _ref2.flip_center;
        var flip_center = _ref2$flip_center === undefined ? { x: 240, y: 240 } : _ref2$flip_center;
        var _ref2$text_center = _ref2.text_center;
        var text_center = _ref2$text_center === undefined ? { x: 240, y: 240 } : _ref2$text_center;

        text += '';
        rotate += flipped ? 180 : 0;
        var transform = 'rotate(' + rotate + ',' + flip_center.x + ',' + flip_center.y + ')';
        var x = text_center.x;
        var y = text_center.y;
        var bkg_width = R.length(text) * 5;
        var bkg_x = text_center.x - bkg_width / 2;
        var bkg_y = text_center.y - 5;
        return {
          text: text,
          x: x, y: y, transform: transform,
          bkg_x: bkg_x, bkg_y: bkg_y, bkg_width: bkg_width
        };
      }
    };
  }
})();
//# sourceMappingURL=element.js.map
