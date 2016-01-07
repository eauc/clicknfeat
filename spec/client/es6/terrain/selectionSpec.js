describe('select terrain', function() {
  describe('defaultMode service', function() {
    beforeEach(inject([
      'defaultMode',
      function(defaultModeService) {
        this.defaultModeService = defaultModeService;

        this.gameService = spyOnService('game');

        this.gameTerrainsService = spyOnService('gameTerrains');
        
        this.gameTerrainSelectionService = spyOnService('gameTerrainSelection');

        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');
      
        this.state = { game: { terrains: 'terrains',
                               model_selection: 'selection',
                               template_selection: 'template_selection',
                               terrain_selection: 'terrain_selection'
                             },
                       changeEvent: jasmine.createSpy('changeEvent'),
                       event: jasmine.createSpy('event')
                     };
        this.state.event.and.callFake((e,l,u) => {
          if('Game.update' === e) {
            this.state.game = R.over(l,u, this.state.game);
          }
          return 'state.event.returnValue';
        });
        this.event = { 'click#': { target: { state: { stamp: 'stamp' } } } };
      }
    ]));

    when('user set terrain selection', function() {
      this.ret = this.defaultModeService.actions
        .selectTerrain(this.state, this.event);
    }, function() {
      it('should set gameTerrainSelection', function() {
        this.thenExpect(this.ret, () => {
          expect(this.gameTerrainSelectionService.set)
            .toHaveBeenCalledWith('local', ['stamp'],
                                  this.state, 'terrain_selection');
          expect(this.state.game.terrain_selection)
            .toBe('gameTerrainSelection.set.returnValue');
        });
      });

      it('should clear gameTemplateSelection', function() {
        this.thenExpect(this.ret, () => {
          expect(this.gameTemplateSelectionService.clear)
            .toHaveBeenCalledWith('local', this.state, 'template_selection');
          expect(this.state.game.template_selection)
            .toBe('gameTemplateSelection.clear.returnValue');
        });
      });
    });
  });

  describe('terrainMode service', function() {
    beforeEach(inject([
      'terrainMode',
      function(terrainModeService) {
        this.terrainModeService = terrainModeService;

        this.gameService = spyOnService('game');

        this.gameTerrainSelectionService = spyOnService('gameTerrainSelection');
      
        this.state = { game: { terrain_selection: 'terrain_selection' },
                       event: jasmine.createSpy('event')
                     };
        this.state.event.and.callFake((e,l,u) => {
          if('Game.update' === e) {
            this.state.game = R.over(l,u, this.state.game);
          }
          return 'state.event.returnValue';
        });
      }
    ]));

    using([
      [ 'action' ],
      [ 'clickMap' ],
      [ 'rightClickMap' ],
    ], function(e) {
      when('user '+e.action, function() {
        this.ret = this.terrainModeService
          .actions[e.action](this.state, 'event');
      }, function() {
        it('should clear local terrain selection', function() {
          expect(this.gameTerrainSelectionService.clear)
            .toHaveBeenCalledWith('local', this.state, 'terrain_selection');
          expect(this.state.game.terrain_selection)
            .toBe('gameTerrainSelection.clear.returnValue');
        });
      });
    });
  });

  describe('gameTerrainSelection service', function() {
    beforeEach(inject([
      'gameTerrainSelection',
      function(gameTerrainSelectionService) {
        this.gameTerrainSelectionService = gameTerrainSelectionService;

        this.gameTerrainsService = spyOnService('gameTerrains');

        this.terrainService = spyOnService('terrain');
        spyOn(this.gameTerrainSelectionService, 'checkMode');
        
        this.state = jasmine.createSpyObj('state', [
          'changeEvent', 'event'
        ]);
        this.state.game = { terrains: 'terrains' };
        this.state.modes = 'modes';
      }
    ]));

    function testChangeLocalSelection() {
      it('should emit change event', function() {
        expect(this.state.changeEvent)
          .toHaveBeenCalledWith('Game.terrain.selection.local.change');
      });
    }
    
    using([
      [ 'where' ],
      [ 'local' ],
      [ 'remote' ],
    ], function(e) {
      when('set('+e.where+', <stamps>, <state>)', function() {
        this.ret = this.gameTerrainSelectionService.set(e.where, this.after,
                                                      this.state, this.selection);
      }, function() {        
        beforeEach(function() {
          this.selection = { local: [ 'before1', 'before2' ],
                             remote: [ 'before1', 'before2' ]
                           };
          this.after = [ 'after1', 'after2' ];
        });

        it('should set <where> selection', function() {
          expect(this.gameTerrainSelectionService.in(e.where, 'after1', this.ret))
            .toBeTruthy();
          expect(this.gameTerrainSelectionService.in(e.where, 'after2', this.ret))
            .toBeTruthy();
          expect(this.gameTerrainSelectionService.in(e.where, 'before1', this.ret))
            .toBeFalsy();
          expect(this.gameTerrainSelectionService.in(e.where, 'before2', this.ret))
            .toBeFalsy();
        });

        it('should emit changeTerrain event', function() {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.terrain.change.after1');
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.terrain.change.after2');
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.terrain.change.before1');
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.terrain.change.before2');
        });

        if(e.where === 'local') {
          testChangeLocalSelection();
        }
      });

      when('removeFrom('+e.where+', <stamps>, <state>)', function() {
        this.ret = this.gameTerrainSelectionService.removeFrom(e.where, this.remove,
                                                             this.state, this.selection);
      }, function() {
        beforeEach(function() {
          this.selection = { local: [ 'stamp1', 'stamp2' ],
                             remote: [ 'stamp1', 'stamp2' ]
                           };
          this.remove = ['stamp2', 'stamp3'];
        });
        
        it('should remove stamps from <where> selection', function() {
          expect(this.gameTerrainSelectionService.in(e.where, 'stamp1', this.ret))
            .toBeTruthy();
          expect(this.gameTerrainSelectionService.in(e.where, 'stamp2', this.ret))
            .toBeFalsy();
          expect(this.gameTerrainSelectionService.in(e.where, 'stamp3', this.ret))
            .toBeFalsy();
        });

        it('should emit changeTerrain event', function() {
          // also emit stamp1 to update single selection styles
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.terrain.change.stamp1');
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.terrain.change.stamp2');
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.terrain.change.stamp3');
        });

        if(e.where === 'local') {
          testChangeLocalSelection();
        }
      });

      when('addTo('+e.where+', <stamps>, <state>)', function() {
        this.ret = this.gameTerrainSelectionService.addTo(e.where, this.add,
                                                        this.state, this.selection);
      }, function() {
        beforeEach(function() {
          this.add = ['stamp2', 'stamp3'];
          this.selection = { local: [ 'stamp1' ],
                             remote: [ 'stamp1' ]
                           };
        });
        
        it('should add stamps to <where> selection', function() {
          expect(this.gameTerrainSelectionService.in(e.where, 'stamp2', this.ret))
            .toBeTruthy();
          expect(this.gameTerrainSelectionService.in(e.where, 'stamp3', this.ret))
            .toBeTruthy();
        });

        it('should emit changeTerrain event', function() {            
          // also emit stamp1 to update single selection styles
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.terrain.change.stamp1');
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.terrain.change.stamp2');
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.terrain.change.stamp3');
        });

        if(e.where === 'local') {
          testChangeLocalSelection();
        }
      });

      when('clear('+e.where+', <stamps>, <state>)', function() {
        this.ret = this.gameTerrainSelectionService
          .clear(e.where, this.state, this.selection);
      }, function() {
        beforeEach(function() {
          this.selection = { local: ['stamp1', 'stamp2'],
                             remote: ['stamp1', 'stamp2']
                           };
        });

        it('should clear <where> selection', function() {
          expect(this.gameTerrainSelectionService.in(e.where, 'stamp1', this.ret))
            .toBeFalsy();
          expect(this.gameTerrainSelectionService.in(e.where, 'stamp2', this.ret))
            .toBeFalsy();
        });

        it('should emit changeTerrain event', function() {            
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.terrain.change.stamp1');
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.terrain.change.stamp2');
        });
      });
    });

    when('checkMode(<state>)', function() {
      this.ret = this.gameTerrainSelectionService
        .checkMode(this.state, this.selection);
    }, function() {
      beforeEach(function() {
        this.gameTerrainSelectionService.checkMode.and.callThrough();
        this.state = { modes: 'modes',
                       game: { terrains: 'terrains' },
                       event: jasmine.createSpy('event')
                     };
        this.selection = { local: [ 'stamp' ] };
      });

      when('<selection> is empty', function() {
        this.selection.local = [];
      }, function() {
        it('should reject check', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('No terrain selection');
          });
        });
      });

      it('should switch to mode for terrain', function() {
        this.thenExpect(this.ret, function() {
          expect(this.state.event)
            .toHaveBeenCalledWith('Modes.switchTo','Terrain');
        });
      });
    });
  });
});
