(function() {
  angular.module('clickApp.services')
    .factory('element', elementModelFactory);

  elementModelFactory.$inject = [
    'point',
  ];
  function elementModelFactory(pointModel) {
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
        renderLabel: elementRenderLabel
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
          (element) => {
            R.deepExtend(element.state, temp);
            return element;
          },
          this.checkState
        );
      }
      function elementStamp(element) {
        return R.path(['state','stamp'], element);
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
        return R.thread(element)(
          R.over(R.lensPath(['state','x']),
                 R.compose(R.max(0), R.min(480))),
          R.over(R.lensPath(['state','y']),
                 R.compose(R.max(0), R.min(480)))
        );
      }
      function elementIsLocked(element) {
        return R.path(['state', 'lk'], element);
      }
      function elementSetLock(set, element) {
        return R.assocPath(['state','lk'], set, element);
      }
      function moveElementP(move) {
        return function(...args) {
          const element = R.last(args);
          const params = R.init(args);
          return R.threadP(element)(
            R.rejectIfP(this.isLocked,
                       `${s.capitalize(type)} is locked`),
            (element) => move.apply(null, [...params, element]),
            this.checkState
          );
        };
      }
      function elementSetPosition(pos, element) {
        return R.thread(element)(
          R.assocPath(['state','x'], pos.x),
          R.assocPath(['state','y'], pos.y)
        );
      }
      function elementShiftPosition(shift, element) {
        return R.thread(element)(
          R.assocPath(['state','x'], element.state.x + shift.x),
          R.assocPath(['state','y'], element.state.y + shift.y)
        );
      }
      function elementSetOrientation(orientation, element) {
        return R.thread(element)(
          R.assocPath(['state','r'], orientation)
        );
      }
      function elementMoveFront(small, element) {
        const dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.thread(element)(
          R.over(R.lensProp('state'),
                 pointModel.moveFront$(dist))
        );
      }
      function elementMoveBack(small, element) {
        const dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.thread(element)(
          R.over(R.lensProp('state'),
                 pointModel.moveBack$(dist))
        );
      }
      function elementRotateLeft(small, element) {
        const angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
        return R.thread(element)(
          R.over(R.lensProp('state'),
                 pointModel.rotateLeft$(angle))
        );
      }
      function elementRotateRight(small, element) {
        const angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
        return R.thread(element)(
          R.over(R.lensProp('state'),
                 pointModel.rotateRight$(angle))
        );
      }
      function elementShiftLeft(small, element) {
        const dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.thread(element)(
          R.over(R.lensProp('state'),
                 pointModel.shiftLeft$(dist))
        );
      }
      function elementShiftRight(small, element) {
        const dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.thread(element)(
          R.over(R.lensProp('state'),
                 pointModel.shiftRight$(dist))
        );
      }
      function elementShiftUp(small, element) {
        const dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.thread(element)(
          R.over(R.lensProp('state'),
                 pointModel.shiftUp$(dist))
        );
      }
      function elementShiftDown(small, element) {
        const dist = MOVES[small ? 'MoveSmall' : 'Move'];
        return R.thread(element)(
          R.over(R.lensProp('state'),
                 pointModel.shiftDown$(dist))
        );
      }
      function elementAddLabel(label, element) {
        return R.over(R.lensPath(['state','l']),
                      R.compose(R.uniq, R.append(label)),
                      element);
      }
      function elementRemoveLabel(label, element) {
        return R.over(R.lensPath(['state','l']),
                      R.reject(R.equals(label)),
                      element);
      }
      function elementClearLabel(element) {
        return R.assocPath(['state','l'], [], element);
      }
      function elementFullLabel(element) {
        return R.pathOr([], ['state','l'], element).join(' ');
      }
      function elementRenderLabel({ rotate_with_model = false,
                                    flipped = false,
                                    flip_center = { x: 240, y: 240 },
                                    text_center = { x: 240, y: 240 },
                                  }, element_state) {
        const text = R.propOr([], 'l', element_state).join(' ');
        const show = R.length(text) > 0 ? true : false;
        let r = (rotate_with_model
                 ? element_state.r
                 : 0
                );
        r += (flipped ? 180 : 0);
        const transform = `rotate(${r},${flip_center.x},${flip_center.y})`;
        const x = text_center.x;
        const y = text_center.y;
        const bkg_width = R.length(text) * 5;
        const bkg_x = text_center.x - bkg_width / 2;
        const bkg_y = text_center.y - 5;
        return {
          text: text,
          show: show,
          x: x, y: y, transform: transform,
          bkg_x: bkg_x, bkg_y: bkg_y, bkg_width: bkg_width
        };
      }
    };
  }
})();
