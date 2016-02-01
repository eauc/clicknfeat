angular.module('clickApp.services')
  .factory('terrain', [
    'settings',
    'point',
    function terrainServiceFactory(settingsService,
                                   pointService) {
      let DEFAULT_MOVES = {
        Move: 10,
        MoveSmall: 1,
        Rotate: 15,
        RotateSmall: 5,
        Shift: 10,
        ShiftSmall: 1
      };
      let MOVES = R.clone(DEFAULT_MOVES);
      settingsService.register('Moves',
                               'Terrain',
                               DEFAULT_MOVES,
                               (moves) => {
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
          return R.path(['state','stamp'], terrain);
        },
        eventName: function terrainEventName(terrain) {
          return R.path(['state','stamp'], terrain);
        },
        state: function terrainState(terrain) {
          return R.prop('state', terrain);
        },
        saveState: function terrainSaveState(terrain) {
          return R.clone(R.prop('state', terrain));
        },
        setState: function terrainSetState(state, terrain) {
          return R.assoc('state', R.clone(state), terrain);
        },
        checkState: function terrainCheckState(terrain) {
          return R.pipe(
            R.over(R.lensPath(['state','x']),
                   R.compose(R.max(0), R.min(480))),
            R.over(R.lensPath(['state','y']),
                   R.compose(R.max(0), R.min(480)))
          )(terrain);
        },
        isLocked: function terrainIsLocked(terrain) {
          return R.path(['state', 'lk'], terrain);
        },
        setLock: function terrainSetLock(set, terrain) {
          return R.assocPath(['state','lk'], set, terrain);
        },
        setPosition: function terrainSet(pos, terrain) {
          if(terrainService.isLocked(terrain)) {
            return self.Promise.reject('Terrain is locked');
          }          
          return R.pipe(
            R.assocPath(['state','x'], pos.x),
            R.assocPath(['state','y'], pos.y),
            terrainService.checkState
          )(terrain);
        },
        shiftPosition: function terrainSet(shift, terrain) {
          if(terrainService.isLocked(terrain)) {
            return self.Promise.reject('Terrain is locked');
          }
          return R.pipe(
            R.assocPath(['state','x'], terrain.state.x + shift.x),
            R.assocPath(['state','y'], terrain.state.y + shift.y),
            terrainService.checkState
          )(terrain);
        },
        setOrientation: function terrainSet(orientation, terrain) {
          if(terrainService.isLocked(terrain)) {
            return self.Promise.reject('Terrain is locked');
          }
          return R.pipe(
            R.assocPath(['state','r'], orientation, terrain),
            terrainService.checkState
          )(terrain);
        },
        moveFront: function terrainMoveFront(small, terrain) {
          if(terrainService.isLocked(terrain)) {
            return self.Promise.reject('Terrain is locked');
          }
          var dist = MOVES[small ? 'MoveSmall' : 'Move'];
          return R.pipe(
            R.over(R.lensProp('state'),
                   pointService.moveFront$(dist)),
            terrainService.checkState
          )(terrain);
        },
        moveBack: function terrainMoveBack(small, terrain) {
          if(terrainService.isLocked(terrain)) {
            return self.Promise.reject('Terrain is locked');
          }
          var dist = MOVES[small ? 'MoveSmall' : 'Move'];
          return R.pipe(
            R.over(R.lensProp('state'),
                   pointService.moveBack$(dist)),
            terrainService.checkState
          )(terrain);
        },
        rotateLeft: function terrainRotateLeft(small, terrain) {
          if(terrainService.isLocked(terrain)) {
            return self.Promise.reject('Terrain is locked');
          }
          var angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
          return R.pipe(
            R.over(R.lensProp('state'),
                   pointService.rotateLeft$(angle)),
            terrainService.checkState
          )(terrain);
        },
        rotateRight: function terrainRotateRight(small, terrain) {
          if(terrainService.isLocked(terrain)) {
            return self.Promise.reject('Terrain is locked');
          }
          var angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
          return R.pipe(
            R.over(R.lensProp('state'),
                   pointService.rotateRight$(angle)),
            terrainService.checkState
          )(terrain);
        },
        shiftLeft: function terrainShiftLeft(small, terrain) {
          if(terrainService.isLocked(terrain)) {
            return self.Promise.reject('Terrain is locked');
          }
          var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
          return R.pipe(
            R.over(R.lensProp('state'),
                   pointService.shiftLeft$(dist)),
            terrainService.checkState
          )(terrain);
        },
        shiftRight: function terrainShiftRight(small, terrain) {
          if(terrainService.isLocked(terrain)) {
            return self.Promise.reject('Terrain is locked');
          }
          var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
          return R.pipe(
            R.over(R.lensProp('state'),
                   pointService.shiftRight$(dist)),
            terrainService.checkState
          )(terrain);
        },
        shiftUp: function terrainShiftUp(small, terrain) {
          if(terrainService.isLocked(terrain)) {
            return self.Promise.reject('Terrain is locked');
          }
          var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
          return R.pipe(
            R.over(R.lensProp('state'),
                   pointService.shiftUp$(dist)),
            terrainService.checkState
          )(terrain);
        },
        shiftDown: function terrainShiftDown(small, terrain) {
          if(terrainService.isLocked(terrain)) {
            return self.Promise.reject('Terrain is locked');
          }
          var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
          return R.pipe(
            R.over(R.lensProp('state'),
                   pointService.shiftDown$(dist)),
            terrainService.checkState
          )(terrain);
        }
      };
      R.curryService(terrainService);
      return terrainService;
    }
  ]);
