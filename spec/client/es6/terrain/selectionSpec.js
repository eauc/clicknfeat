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
      
        this.scope = { game: { terrains: 'terrains',
                               model_selection: 'selection',
                               template_selection: 'template_selection',
                               terrain_selection: 'terrain_selection'
                             }
                     };
        this.scope.gameEvent = jasmine.createSpy('gameEvent');
        this.event = { 'click#': { target: { state: { stamp: 'stamp' } } } };
      }
    ]));

    when('user set terrain selection', function() {
      this.ret = this.defaultModeService.actions
        .selectTerrain(this.scope, this.event);
    }, function() {
      it('should set gameTerrainSelection', function() {
        expect(this.gameTerrainSelectionService.set)
          .toHaveBeenCalledWith('local', ['stamp'],
                                this.scope, 'terrain_selection');
        expect(this.scope.game.terrain_selection)
          .toBe('gameTerrainSelection.set.returnValue');
      });

      it('should clear gameTemplateSelection', function() {
        expect(this.gameTemplateSelectionService.clear)
          .toHaveBeenCalledWith('local', this.scope, 'template_selection');
        expect(this.scope.game.template_selection)
          .toBe('gameTemplateSelection.clear.returnValue');
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
      
        this.scope = { game: { terrain_selection: 'terrain_selection' } };
      }
    ]));

    using([
      [ 'action' ],
      [ 'clickMap' ],
      [ 'rightClickMap' ],
    ], function(e) {
      when('user '+e.action, function() {
        this.ret = this.terrainModeService
          .actions[e.action](this.scope, 'event');
      }, function() {
        it('should clear local terrain selection', function() {
          expect(this.gameTerrainSelectionService.clear)
            .toHaveBeenCalledWith('local', this.scope, 'terrain_selection');
          expect(this.scope.game.terrain_selection)
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
        
        this.scope = jasmine.createSpyObj('scope', [
          'gameEvent', 'doSwitchToMode'
        ]);
        this.scope.game = { terrains: 'terrains' };
        this.scope.modes = 'modes';
      }
    ]));

    function testChangeLocalSelection() {
      it('should switch to Default mode', function() {
        expect(this.scope.doSwitchToMode)
          .toHaveBeenCalledWith('Default');
      });
    }
    
    using([
      [ 'where' ],
      [ 'local' ],
      [ 'remote' ],
    ], function(e) {
      when('set('+e.where+', <stamps>, <scope>)', function() {
        this.ret = this.gameTerrainSelectionService.set(e.where, this.after,
                                                      this.scope, this.selection);
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
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeTerrain-after1');
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeTerrain-after2');
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeTerrain-before1');
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeTerrain-before2');
        });

        if(e.where === 'local') {
          testChangeLocalSelection();
        }
      });

      when('removeFrom('+e.where+', <stamps>, <scope>)', function() {
        this.ret = this.gameTerrainSelectionService.removeFrom(e.where, this.remove,
                                                             this.scope, this.selection);
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
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeTerrain-stamp1');
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeTerrain-stamp2');
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeTerrain-stamp3');
        });

        if(e.where === 'local') {
          testChangeLocalSelection();
        }
      });

      when('addTo('+e.where+', <stamps>, <scope>)', function() {
        this.ret = this.gameTerrainSelectionService.addTo(e.where, this.add,
                                                        this.scope, this.selection);
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
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeTerrain-stamp1');
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeTerrain-stamp2');
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeTerrain-stamp3');
        });

        if(e.where === 'local') {
          testChangeLocalSelection();
        }
      });

      when('clear('+e.where+', <stamps>, <scope>)', function() {
        this.ret = this.gameTerrainSelectionService
          .clear(e.where, this.scope, this.selection);
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
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeTerrain-stamp1');
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeTerrain-stamp2');
        });

        if(e.where === 'local') {
          it('should check mode for selection', function() {   
            expect(this.scope.doSwitchToMode)
              .toHaveBeenCalledWith('Default');
          });
        }
      });
    });

    when('checkMode(<scope>)', function() {
      this.ret = this.gameTerrainSelectionService
        .checkMode(this.scope, this.selection);
    }, function() {
      beforeEach(function() {
        this.gameTerrainSelectionService.checkMode.and.callThrough();
        this.scope = { modes: 'modes',
                       game: { terrains: 'terrains' },
                       doSwitchToMode: jasmine.createSpy('doSwitchToMode')
                     };
        this.selection = { local: [ 'stamp' ] };
        // this.terrainService.isPlacing._retVal = false;
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
          expect(this.scope.doSwitchToMode)
            .toHaveBeenCalledWith('Terrain');
        });
      });
    });
  });
});
