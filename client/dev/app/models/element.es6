(function() {
  angular.module('clickApp.services')
    .factory('element', elementModelFactory);

  elementModelFactory.$inject = [
    'point',
  ];
  function elementModelFactory(pointModel) {
    const STATE_LENS = R.lensProp('state');
    const STAMP_LENS = R.lensPath(['state', 'stamp']);
    const LOCK_LENS = R.lensPath(['state', 'lk']);
    const LABEL_LENS = R.lensPath(['state', 'l']);
    const X_LENS = R.lensPath(['state', 'x']);
    const Y_LENS = R.lensPath(['state', 'y']);
    const R_LENS = R.lensPath(['state', 'y']);
    const saturateXY = R.compose(R.max(0), R.min(480));
    return function buildElementModel(type, MOVES) {
      const elementModel = {
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
        return R.thread(temp)(
          this.createDefault,
          R.tap((element) => {
            R.deepExtend(element.state, temp);
          }),
          this.checkState
        );
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
        return R.thread(element)(
          R.over(X_LENS, saturateXY),
          R.over(Y_LENS, saturateXY)
        );
      }
      function elementIsLocked(element) {
        return R.view(LOCK_LENS, element);
      }
      function elementSetLock(set, element) {
        return R.set(LOCK_LENS, set, element);
      }
      function moveElementP(move) {
        return function(...args) {
          const element = R.last(args);
          const params = R.init(args);
          return R.threadP(element)(
            R.rejectIfP(this.isLocked,
                       `${s.capitalize(type)} is locked`),
            (element) => move(...params, element),
            this.checkState
          );
        };
      }
      function elementSetPosition(pos, element) {
        return R.thread(element)(
          R.set(X_LENS, pos.x),
          R.set(Y_LENS, pos.y)
        );
      }
      function elementShiftPosition(shift, element) {
        return R.thread(element)(
          R.set(X_LENS, element.state.x + shift.x),
          R.set(Y_LENS, element.state.y + shift.y)
        );
      }
      function elementSetOrientation(orientation, element) {
        return R.set(R_LENS, orientation, element);
      }
      function elementMoveFront(small, element) {
        const dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.over(
          STATE_LENS,
          pointModel.moveFront$(dist),
          element
        );
      }
      function elementMoveBack(small, element) {
        const dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.over(
          STATE_LENS,
          pointModel.moveBack$(dist),
          element
        );
      }
      function elementRotateLeft(small, element) {
        const angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
        return R.over(
          STATE_LENS,
          pointModel.rotateLeft$(angle),
          element
        );
      }
      function elementRotateRight(small, element) {
        const angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
        return R.over(
          STATE_LENS,
          pointModel.rotateRight$(angle),
          element
        );
      }
      function elementShiftLeft(small, element) {
        const dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.over(
          STATE_LENS,
          pointModel.shiftLeft$(dist),
          element
        );
      }
      function elementShiftRight(small, element) {
        const dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.over(
          STATE_LENS,
          pointModel.shiftRight$(dist),
          element
        );
      }
      function elementShiftUp(small, element) {
        const dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.over(
          STATE_LENS,
          pointModel.shiftUp$(dist),
          element
        );
      }
      function elementShiftDown(small, element) {
        const dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.over(
          STATE_LENS,
          pointModel.shiftDown$(dist),
          element
        );
      }
      function elementAddLabel(label, element) {
        return R.over(
          LABEL_LENS,
          R.compose(R.uniq, R.append(label)),
          element
        );
      }
      function elementRemoveLabel(label, element) {
        return R.over(
          LABEL_LENS,
          R.reject(R.equals(label)),
          element
        );
      }
      function elementClearLabel(element) {
        return R.set(LABEL_LENS, [], element);
      }
      function elementFullLabel(element) {
        return R.viewOr([], LABEL_LENS, element).join(' ');
      }
      function elementRenderLabel({ rotate_with_model = false,
                                    flipped = false,
                                    flip_center = { x: 240, y: 240 },
                                    text_center = { x: 240, y: 240 },
                                  }, element_state) {
        const text = R.propOr([], 'l', element_state).join(' ');
        const show = R.length(text) > 0 ? true : false;
        let rotate = (rotate_with_model
                      ? element_state.r
                      : 0
                     );
        const label = elementModel.renderText({
          rotate, flipped, flip_center, text_center
        }, text);
        label.show = show;
        return label;
      }
      function elementRenderText({ rotate = 0,
                                   flipped = false,
                                   flip_center = { x: 240, y: 240 },
                                   text_center = { x: 240, y: 240 },
                                 }, text) {
        text += '';
        rotate += (flipped ? 180 : 0);
        const transform = `rotate(${rotate},${flip_center.x},${flip_center.y})`;
        const x = text_center.x;
        const y = text_center.y;
        const bkg_width = R.length(text) * 5;
        const bkg_x = text_center.x - bkg_width / 2;
        const bkg_y = text_center.y - 5;
        return {
          text,
          x, y, transform,
          bkg_x, bkg_y, bkg_width
        };
      }
    };
  }
})();
