describe('move terrain', function() {
  describe('terrainMode service', function() {
    beforeEach(inject([
      'terrainMode',
      function(terrainModeService) {
        this.terrainModeService = terrainModeService;
        this.gameService = spyOnService('game');
        this.gameTerrainSelectionService = spyOnService('gameTerrainSelection');
        this.gameTerrainSelectionService.get._retVal = 'stamps';

        this.state = {
          game: { terrain_selection: 'selection' },
          event: jasmine.createSpy('event')
        };
      }
    ]));

    using([
      [ 'action' ],
      [ 'moveFront' ],
      [ 'moveBack' ],
      [ 'rotateLeft' ],
      [ 'rotateRight' ],
    ], function(e) {
      when('user '+e.action+' terrain selection', function() {
        this.ret = this.terrainModeService.actions[e.action](this.state);
      }, function() {
        it('should get current selection', function() {
          expect(this.gameTerrainSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
        });

        it('should execute onTerrains/'+e.action+' command', function() {
          expect(this.state.event)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onTerrains', [ e.action, [false], 'stamps' ]);
        });
      });

      when('user '+e.action+'Small terrain selection', function() {
        this.ret = this.terrainModeService.actions[e.action+'Small'](this.state);
      }, function() {
        it('should get current selection', function() {
          expect(this.gameTerrainSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
        });

        it('should execute onTerrains/'+e.action+'Small command', function() {
          expect(this.state.event)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onTerrains', [ e.action, [true], 'stamps' ]);
        });
      });
    });

    using([
      [ 'action'     , 'flipped_action' ],
      [ 'shiftUp'    , 'shiftDown'      ],
      [ 'shiftDown'  , 'shiftUp'        ],
      [ 'shiftLeft'  , 'shiftRight'     ],
      [ 'shiftRight' , 'shiftLeft'      ],
    ], function(e) {
      when('user '+e.action+' terrain selection', function() {
        this.ret = this.terrainModeService.actions[e.action](this.state);
      }, function() {
        it('should get current selection', function() {
          expect(this.gameTerrainSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
        });

        it('should execute onTerrains/'+e.action+' command', function() {
          expect(this.state.event)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onTerrains', [ e.action, [false], 'stamps' ]);
        });

        when('map is flipped', function() {
          this.state.ui_state = { flip_map: true };
        }, function() {
          it('should execute onTerrains/'+e.flipped_action+' command', function() {
            expect(this.state.event)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onTerrains', [ e.flipped_action, [false], 'stamps' ]);
          });
        });
      });

      when('user '+e.action+'Small terrain selection', function() {
        this.ret = this.terrainModeService.actions[e.action+'Small'](this.state);
      }, function() {
        it('should get current selection', function() {
          expect(this.gameTerrainSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
        });

        it('should execute onTerrains/'+e.action+'Small command', function() {
          expect(this.state.event)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onTerrains', [ e.action, [true], 'stamps' ]);
        });

        when('map is flipped', function() {
          this.state.ui_state = { flip_map: true };
        }, function() {
          it('should execute onTerrains/'+e.flipped_action+'Small command', function() {
            expect(this.state.event)
              .toHaveBeenCalledWith('Game.command.execute',
                                    'onTerrains', [ e.flipped_action, [true], 'stamps' ]);
          });
        });
      });
    });
  });

  describe('terrain service', function() {
    beforeEach(inject([
      'terrain',
      function(terrainService) {
        this.terrainService = terrainService;
        spyOn(this.terrainService, 'checkState')
          .and.callFake(R.identity);
      }
    ]));

    using([
      [ 'move', 'base', 'result', 'small_result' ],
      [ 'rotateLeft', 5.905,
        { x: 240, y: 240, r: 165 },
        { x: 240, y: 240, r: 175 } ],
      [ 'rotateRight', 5.905,
        { x: 240, y: 240, r: 195 },
        { x: 240, y: 240, r: 185 } ],
      [ 'moveFront', 5.905,
        { x: 240, y: 250, r: 180 },
        { x: 240, y: 241, r: 180 } ],
      [ 'moveBack', 7.874,
        { x: 240, y: 230, r: 180 },
        { x: 240, y: 239, r: 180 } ],
      [ 'shiftLeft', 9.842,
        { x: 230, y: 240, r: 180 },
        { x: 239, y: 240, r: 180 } ],
      [ 'shiftRight', 24.605,
        { x: 250, y: 240, r: 180 },
        { x: 241, y: 240, r: 180 } ],
      [ 'shiftUp', 5.905,
        { x: 240, y: 230, r: 180 },
        { x: 240, y: 239, r: 180 } ],
      [ 'shiftDown', 5.905,
        { x: 240, y: 250, r: 180 },
        { x: 240, y: 241, r: 180 } ],
    ], function(e) {
      using([
        [ 'small', 'result' ],
        [ false  , e.result ],
        [ true   , e.small_result ],
      ], function(ee, dd) {
        when(e.move+'(<small>)', function() {
          this.ret = this.terrainService[e.move](ee.small, this.terrain);
        }, function() {
          beforeEach(function() {
            this.terrain = {
              state: { stamp: 'stamp', info: 'info', x: 240, y: 240, r: 180, dsp:[] }
            };
          });

          it('should '+e.move+' terrain, '+dd, function() {
            expect(R.pick(['x','y','r'], this.ret.state))
              .toEqual(ee.result);
          });

          it('should check state', function() {
            expect(this.terrainService.checkState)
              .toHaveBeenCalledWith(this.ret);
          });
        
          when('terrain is locked', function() {
            this.terrain = this.terrainService
              .setLock(true, this.terrain);
          }, function() {
            it('should reject move', function() {
              this.thenExpectError(this.ret, function(reason) {
                expect(reason).toBe('Terrain is locked');
              });
            });
          });
        });
      });
    });
  });
});
