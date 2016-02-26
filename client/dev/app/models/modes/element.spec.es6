describe('elementMode model', function() {
  beforeEach(inject([
    'elementMode',
    function(elementModeModel) {
      this.elementModel = spyOnService('terrain');
      this.gameElementsModel = spyOnService('gameTerrains');
      this.gameElementSelectionModel = spyOnService('gameTerrainSelection');

      this.elementModeModel =
        elementModeModel('type',
                         this.elementModel,
                         this.gameElementsModel,
                         this.gameElementSelectionModel);

      this.state = {
        create: {},
        game: { types: 'elements',
                type_selection: 'selection' },
        eventP: jasmine.createSpy('eventP')
      };
    }
  ]));

  context('when use copies element', function() {
    return this.elementModeModel.actions
      .copySelection(this.state);
  }, function() {
    it('should copy current selection', function() {
      expect(this.gameElementSelectionModel.get)
        .toHaveBeenCalledWith('local', 'selection');
      expect(this.gameElementsModel.copyStampsP)
        .toHaveBeenCalledWith('gameTerrainSelection.get.returnValue', 'elements');
    });

    it('should enter createElement mode', function() {
      expect(this.state.create)
        .toBe('gameTerrains.copyStampsP.returnValue');
      expect(this.state.eventP)
        .toHaveBeenCalledWith('Modes.switchTo','CreateType');
    });
  });

  context('when user deletes element', function() {
    return this.elementModeModel.actions
      .delete(this.state);
  }, function() {
    beforeEach(function() {
      this.gameElementSelectionModel.get
        .and.returnValue('stamps');
    });

    it('should execute deleteElementCommand', function() {
      expect(this.gameElementSelectionModel.get)
        .toHaveBeenCalledWith('local', 'selection');
      expect(this.state.eventP)
        .toHaveBeenCalledWith('Game.command.execute',
                              'deleteType', ['stamps']);
    });
  });

  example(function(e) {
    context('when user '+e.action+' element selection', function() {
      return this.elementModeModel
        .actions[e.action](this.state);
    }, function() {
      beforeEach(function() {
        this.gameElementSelectionModel.get
          .and.returnValue('stamps');
      });

      it('should get current selection', function() {
        expect(this.gameElementSelectionModel.get)
          .toHaveBeenCalledWith('local', 'selection');
      });

      it('should execute onElements/'+e.action+' command', function() {
        expect(this.state.eventP)
          .toHaveBeenCalledWith('Game.command.execute',
                                'onTypes', [ `${e.action}P`, [false], 'stamps' ]);
      });
    });

    context('when user '+e.action+'Small element selection', function() {
      return this.elementModeModel
        .actions[e.action+'Small'](this.state);
    }, function() {
      beforeEach(function() {
        this.gameElementSelectionModel.get
          .and.returnValue('stamps');
      });

      it('should get current selection', function() {
        expect(this.gameElementSelectionModel.get)
          .toHaveBeenCalledWith('local', 'selection');
      });

      it('should execute onElements/'+e.action+'Small command', function() {
        expect(this.state.eventP)
          .toHaveBeenCalledWith('Game.command.execute',
                                'onTypes', [ `${e.action}P`, [true], 'stamps' ]);
      });
    });
  }, [
    [ 'action'      ],
    [ 'moveFront'   ],
    [ 'moveBack'    ],
    [ 'rotateLeft'  ],
    [ 'rotateRight' ],
  ]);

  example(function(e) {
    context('when user '+e.action+' element selection', function() {
      return this.elementModeModel
        .actions[e.action](this.state);
    }, function() {
      beforeEach(function() {
        this.gameElementSelectionModel.get
          .and.returnValue('stamps');
      });

      it('should get current selection', function() {
        expect(this.gameElementSelectionModel.get)
          .toHaveBeenCalledWith('local', 'selection');
      });

      it('should execute onElements/'+e.action+' command', function() {
        expect(this.state.eventP)
          .toHaveBeenCalledWith('Game.command.execute',
                                'onTypes',
                                [ `${e.action}P`, [false], 'stamps' ]);
      });

      context('when map is flipped', function() {
        this.state.ui_state = { flip_map: true };
      }, function() {
        it('should execute onElements/'+e.flipped_action+' command', function() {
          expect(this.state.eventP)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onTypes',
                                  [ `${e.flipped_action}P`, [false], 'stamps' ]);
        });
      });
    });

    context('when user '+e.action+'Small element selection', function() {
      return this.elementModeModel
        .actions[e.action+'Small'](this.state);
    }, function() {
      beforeEach(function() {
        this.gameElementSelectionModel.get
          .and.returnValue('stamps');
      });

      it('should get current selection', function() {
        expect(this.gameElementSelectionModel.get)
          .toHaveBeenCalledWith('local', 'selection');
      });

      it('should execute onElements/'+e.action+'Small command', function() {
        expect(this.state.eventP)
          .toHaveBeenCalledWith('Game.command.execute',
                                'onTypes',
                                [ `${e.action}P`, [true], 'stamps' ]);
      });

      context('when map is flipped', function() {
        this.state.ui_state = { flip_map: true };
      }, function() {
        it('should execute onElements/'+e.flipped_action+'Small command', function() {
          expect(this.state.eventP)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onTypes',
                                  [ `${e.flipped_action}P`, [true], 'stamps' ]);
        });
      });
    });
  }, [
    [ 'action'     , 'flipped_action' ],
    [ 'shiftUp'    , 'shiftDown'      ],
    [ 'shiftDown'  , 'shiftUp'        ],
    [ 'shiftLeft'  , 'shiftRight'     ],
    [ 'shiftRight' , 'shiftLeft'      ],
  ]);

  describe('drag', function() {
    beforeEach(function() {
      this.elementModel.saveState.and.callThrough();
      this.elementModel.eventName.and.callThrough();

      this.state = R.extend(this.state, {
        game: { type_selection: 'selection',
                types: [ { state: { stamp: 'stamp1', x: 240, y: 240, r: 180 } },
                         { state: { stamp: 'stamp2', x: 200, y: 300, r:  90 } } ]
              },
        queueChangeEventP: jasmine.createSpy('queueChangeEventP')
      });
      this.state.eventP.and.callFake((e,l,u) => {
        if('Game.update' === e) {
          this.state.game = R.over(l,u, this.state.game);
        }
        return 'state.eventP.returnValue';
      });

      this.event = {
        target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
        start: { x: 200, y: 200 },
        now: { x: 210, y: 201 }
      };

      this.elementModel.isLocked
        .and.returnValue(false);
      this.elementModel.setPositionP
        .resolveWith((f, t, p, m) => {
          return m;
        });

      this.gameElementsModel.findAnyStampsP
        .resolveWith((ss, ms) => {
          return R.map(function(s) {
            return R.find(R.pathEq(['state','stamp'], s), ms);
          }, ss);
        });

      this.gameElementSelectionModel.get
        .and.returnValue(['stamp1']);
      this.gameElementSelectionModel.in
        .and.returnValue(true);
    });

    context('when user starts dragging element', function() {
      return this.elementModeModel.actions
        .dragStartType(this.state, this.event);
    }, function() {
      shouldRejectDragWhenElementIsLocked();

      it('should set current selection', function() {
        expect(this.gameElementSelectionModel.set)
          .toHaveBeenCalledWith('local', ['stamp'],
                                this.state, 'selection');
      });

      it('should update target position', function() {
        expect(R.pick(['x','y'], this.event.target.state))
            .toEqual({ x: 250, y: 241 });
      });

      shouldEmitChangeElementEvent();
    });

    context('when user drags element', function() {
      return this.elementModeModel.actions
        .dragType(this.state, this.event);
    }, function() {
      beforeEach(function() {
        this.elementModeModel.actions
          .dragStartType(this.state, this.event);

        this.elementModel.setPositionP.calls.reset();
        this.state.queueChangeEventP.calls.reset();

        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 230, y: 190 }
        };
      });

      shouldRejectDragWhenElementIsLocked();

      it('should update target position', function() {
        expect(R.pick(['x','y'], this.event.target.state))
            .toEqual({ x: 270, y: 230 });
      });

      shouldEmitChangeElementEvent();
    });

    context('when user ends draging element', function() {
      return this.elementModeModel.actions
        .dragEndType(this.state, this.event);
    }, function() {
      beforeEach(function() {
        this.elementModeModel.actions
          .dragStartType(this.state, this.event);

        this.state.queueChangeEventP.calls.reset();
        this.elementModel.setPositionP.calls.reset();

        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 230, y: 190 }
        };
      });

      shouldRejectDragWhenElementIsLocked();

      it('should restore dragStart element position', function() {
        expect(R.pick(['x','y'], this.event.target.state))
            .toEqual({ x: 240, y: 240 });
      });

      it('should execute onElements/setPosition command', function() {
        expect(this.state.eventP)
          .toHaveBeenCalledWith('Game.command.execute',
                                'onTypes', [
                                  'setPositionP',
                                  [ { stamp: 'stamp', x: 270, y: 230, r: 180 } ],
                                  ['stamp']
                                ]);
      });
    });

    function shouldRejectDragWhenElementIsLocked() {
      context('when element is locked', function() {
        this.elementModel.isLocked
          .and.returnValue(true);
        this.expectContextError();
      }, function() {
        it('should reject drag', function() {
          expect(this.contextError).toEqual([
            'Type is locked'
          ]);
        });
      });
    }
    function shouldEmitChangeElementEvent() {
      it('should emit changeElement event', function() {
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.type.change.stamp');
      });
    }
  });

  context('when user toggles lock on elements', function() {
    return this.elementModeModel.actions
      .toggleLock(this.state);
  }, function() {
    example(function(e, d) {
      context('when first selected element\'s isLocked === '+e.first, function() {
        this.elementModel.isLocked
          .and.returnValue(e.first);
      }, function() {
        beforeEach(function() {
          this.gameElementSelectionModel.get
            .and.returnValue(['stamp1','stamp2']);
        });

        it('should toggle lock on local selection, '+d, function() {
          expect(this.gameElementSelectionModel.get)
            .toHaveBeenCalledWith('local', 'selection');
          expect(this.gameElementsModel.findStampP)
            .toHaveBeenCalledWith('stamp1', 'elements');

          expect(this.elementModel.isLocked)
            .toHaveBeenCalledWith('gameTerrains.findStampP.returnValue');
          expect(this.state.eventP)
            .toHaveBeenCalledWith(
              'Game.command.execute',
              'lockTypes',
              [ e.set, ['stamp1','stamp2'] ]
            );
        });
      });
    }, [
      [ 'first' , 'set' ],
      [ true    , false ],
      [ false   , true  ],
    ]);
  });

  example(function(e) {
    context('when user '+e.action, function() {
      return this.elementModeModel
        .actions[e.action](this.state, 'event');
    }, function() {
      beforeEach(function() {
        this.state.eventP.and.callFake((e,l,u) => {
          if('Game.update' === e) {
            this.state.game = R.over(l,u, this.state.game);
          }
          return 'state.event.returnValue';
        });
      });

      it('should clear local element selection', function() {
        expect(this.gameElementSelectionModel.clear)
          .toHaveBeenCalledWith('local', this.state, 'selection');
        expect(this.state.game.type_selection)
          .toBe('gameTerrainSelection.clear.returnValue');
      });
    });
  }, [
    [ 'action'        ],
    [ 'clickMap'      ],
    [ 'rightClickMap' ],
  ]);
});
