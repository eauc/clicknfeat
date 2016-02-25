describe('terrainMode model', function() {
  beforeEach(inject([
    'terrainMode',
    function(terrainModeModel) {
      this.terrainModeModel = terrainModeModel;

      this.terrainModel = spyOnService('terrain');
      this.gameTerrainsModel = spyOnService('gameTerrains');
      this.gameTerrainSelectionModel = spyOnService('gameTerrainSelection');

      this.state = {
        create: {},
        game: { terrains: 'terrains',
                terrain_selection: 'selection' },
        eventP: jasmine.createSpy('eventP')
      };
    }
  ]));

  context('when use copies terrain', function() {
    return this.terrainModeModel.actions
      .copySelection(this.state);
  }, function() {
    it('should copy current selection', function() {
      expect(this.gameTerrainSelectionModel.get)
        .toHaveBeenCalledWith('local', 'selection');
      expect(this.gameTerrainsModel.copyStampsP)
        .toHaveBeenCalledWith('gameTerrainSelection.get.returnValue', 'terrains');
    });

    it('should enter createTerrain mode', function() {
      expect(this.state.create)
        .toBe('gameTerrains.copyStampsP.returnValue');
      expect(this.state.eventP)
        .toHaveBeenCalledWith('Modes.switchTo','CreateTerrain');
    });
  });

  context('when user deletes terrain', function() {
    return this.terrainModeModel.actions
      .delete(this.state);
  }, function() {
    beforeEach(function() {
      this.gameTerrainSelectionModel.get
        .and.returnValue('stamps');
    });

    it('should execute deleteTerrainCommand', function() {
      expect(this.gameTerrainSelectionModel.get)
        .toHaveBeenCalledWith('local', 'selection');
      expect(this.state.eventP)
        .toHaveBeenCalledWith('Game.command.execute',
                              'deleteTerrain', ['stamps']);
    });
  });

  example(function(e) {
    context('when user '+e.action+' terrain selection', function() {
      return this.terrainModeModel
        .actions[e.action](this.state);
    }, function() {
      beforeEach(function() {
        this.gameTerrainSelectionModel.get
          .and.returnValue('stamps');
      });

      it('should get current selection', function() {
        expect(this.gameTerrainSelectionModel.get)
          .toHaveBeenCalledWith('local', 'selection');
      });

      it('should execute onTerrains/'+e.action+' command', function() {
        expect(this.state.eventP)
          .toHaveBeenCalledWith('Game.command.execute',
                                'onTerrains', [ `${e.action}P`, [false], 'stamps' ]);
      });
    });

    context('when user '+e.action+'Small terrain selection', function() {
      return this.terrainModeModel
        .actions[e.action+'Small'](this.state);
    }, function() {
      beforeEach(function() {
        this.gameTerrainSelectionModel.get
          .and.returnValue('stamps');
      });

      it('should get current selection', function() {
        expect(this.gameTerrainSelectionModel.get)
          .toHaveBeenCalledWith('local', 'selection');
      });

      it('should execute onTerrains/'+e.action+'Small command', function() {
        expect(this.state.eventP)
          .toHaveBeenCalledWith('Game.command.execute',
                                'onTerrains', [ `${e.action}P`, [true], 'stamps' ]);
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
    context('when user '+e.action+' terrain selection', function() {
      return this.terrainModeModel
        .actions[e.action](this.state);
    }, function() {
      beforeEach(function() {
        this.gameTerrainSelectionModel.get
          .and.returnValue('stamps');
      });

      it('should get current selection', function() {
        expect(this.gameTerrainSelectionModel.get)
          .toHaveBeenCalledWith('local', 'selection');
      });

      it('should execute onTerrains/'+e.action+' command', function() {
        expect(this.state.eventP)
          .toHaveBeenCalledWith('Game.command.execute',
                                'onTerrains',
                                [ `${e.action}P`, [false], 'stamps' ]);
      });

      context('when map is flipped', function() {
        this.state.ui_state = { flip_map: true };
      }, function() {
        it('should execute onTerrains/'+e.flipped_action+' command', function() {
          expect(this.state.eventP)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onTerrains',
                                  [ `${e.flipped_action}P`, [false], 'stamps' ]);
        });
      });
    });

    context('when user '+e.action+'Small terrain selection', function() {
      return this.terrainModeModel
        .actions[e.action+'Small'](this.state);
    }, function() {
      beforeEach(function() {
        this.gameTerrainSelectionModel.get
          .and.returnValue('stamps');
      });

      it('should get current selection', function() {
        expect(this.gameTerrainSelectionModel.get)
          .toHaveBeenCalledWith('local', 'selection');
      });

      it('should execute onTerrains/'+e.action+'Small command', function() {
        expect(this.state.eventP)
          .toHaveBeenCalledWith('Game.command.execute',
                                'onTerrains',
                                [ `${e.action}P`, [true], 'stamps' ]);
      });

      context('when map is flipped', function() {
        this.state.ui_state = { flip_map: true };
      }, function() {
        it('should execute onTerrains/'+e.flipped_action+'Small command', function() {
          expect(this.state.eventP)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onTerrains',
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
      this.terrainModel.saveState.and.callThrough();
      this.terrainModel.eventName.and.callThrough();

      this.state = R.extend(this.state, {
        game: { terrain_selection: 'selection',
                terrains: [ { state: { stamp: 'stamp1', x: 240, y: 240, r: 180 } },
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

      this.terrainModel.isLocked
        .and.returnValue(false);
      this.terrainModel.setPositionP
        .resolveWith((f, t, p, m) => {
          return m;
        });

      this.gameTerrainsModel.findAnyStampsP
        .resolveWith((ss, ms) => {
          return R.map(function(s) {
            return R.find(R.pathEq(['state','stamp'], s), ms);
          }, ss);
        });

      this.gameTerrainSelectionModel.get
        .and.returnValue(['stamp1']);
      this.gameTerrainSelectionModel.in
        .and.returnValue(true);
    });

    context('when user starts dragging terrain', function() {
      return this.terrainModeModel.actions
        .dragStartTerrain(this.state, this.event);
    }, function() {
      shouldRejectDragWhenTerrainIsLocked();

      it('should set current selection', function() {
        expect(this.gameTerrainSelectionModel.set)
          .toHaveBeenCalledWith('local', ['stamp'],
                                this.state, 'selection');
      });

      it('should update target position', function() {
        expect(R.pick(['x','y'], this.event.target.state))
            .toEqual({ x: 250, y: 241 });
      });

      shouldEmitChangeTerrainEvent();
    });

    context('when user drags terrain', function() {
      return this.terrainModeModel.actions
        .dragTerrain(this.state, this.event);
    }, function() {
      beforeEach(function() {
        this.terrainModeModel.actions
          .dragStartTerrain(this.state, this.event);

        this.terrainModel.setPositionP.calls.reset();
        this.state.queueChangeEventP.calls.reset();

        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 230, y: 190 }
        };
      });

      shouldRejectDragWhenTerrainIsLocked();

      it('should update target position', function() {
        expect(R.pick(['x','y'], this.event.target.state))
            .toEqual({ x: 270, y: 230 });
      });

      shouldEmitChangeTerrainEvent();
    });

    context('when user ends draging terrain', function() {
      return this.terrainModeModel.actions
        .dragEndTerrain(this.state, this.event);
    }, function() {
      beforeEach(function() {
        this.terrainModeModel.actions
          .dragStartTerrain(this.state, this.event);

        this.state.queueChangeEventP.calls.reset();
        this.terrainModel.setPositionP.calls.reset();

        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 230, y: 190 }
        };
      });

      shouldRejectDragWhenTerrainIsLocked();

      it('should restore dragStart terrain position', function() {
        expect(R.pick(['x','y'], this.event.target.state))
            .toEqual({ x: 240, y: 240 });
      });

      it('should execute onTerrains/setPosition command', function() {
        expect(this.state.eventP)
          .toHaveBeenCalledWith('Game.command.execute',
                                'onTerrains', [
                                  'setPositionP',
                                  [ { stamp: 'stamp', x: 270, y: 230, r: 180 } ],
                                  ['stamp']
                                ]);
      });
    });

    function shouldRejectDragWhenTerrainIsLocked() {
      context('when terrain is locked', function() {
        this.terrainModel.isLocked
          .and.returnValue(true);
        this.expectContextError();
      }, function() {
        it('should reject drag', function() {
          expect(this.contextError).toEqual([
            'Terrain is locked'
          ]);
        });
      });
    }
    function shouldEmitChangeTerrainEvent() {
      it('should emit changeTerrain event', function() {
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.terrain.change.stamp');
      });
    }
  });

  context('when user toggles lock on terrains', function() {
    return this.terrainModeModel.actions
      .toggleLock(this.state);
  }, function() {
    example(function(e, d) {
      context('when first selected terrain\'s isLocked === '+e.first, function() {
        this.terrainModel.isLocked
          .and.returnValue(e.first);
      }, function() {
        beforeEach(function() {
          this.gameTerrainSelectionModel.get
            .and.returnValue(['stamp1','stamp2']);
        });

        it('should toggle lock on local selection, '+d, function() {
          expect(this.gameTerrainSelectionModel.get)
            .toHaveBeenCalledWith('local', 'selection');
          expect(this.gameTerrainsModel.findStampP)
            .toHaveBeenCalledWith('stamp1', 'terrains');

          expect(this.terrainModel.isLocked)
            .toHaveBeenCalledWith('gameTerrains.findStampP.returnValue');
          expect(this.state.eventP)
            .toHaveBeenCalledWith(
              'Game.command.execute',
              'lockTerrains',
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
      return this.terrainModeModel
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

      it('should clear local terrain selection', function() {
        expect(this.gameTerrainSelectionModel.clear)
          .toHaveBeenCalledWith('local', this.state, 'selection');
        expect(this.state.game.terrain_selection)
          .toBe('gameTerrainSelection.clear.returnValue');
      });
    });
  }, [
    [ 'action'        ],
    [ 'clickMap'      ],
    [ 'rightClickMap' ],
  ]);
});
