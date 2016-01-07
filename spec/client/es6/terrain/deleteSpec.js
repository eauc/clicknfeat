describe('delete terrain', function() {
  describe('terrainMode service', function() {
    beforeEach(inject([
      'terrainMode',
      function(terrainModeService) {
        this.terrainModeService = terrainModeService;

        this.gameTerrainSelectionService = spyOnService('gameTerrainSelection');
        this.gameTerrainSelectionService.get._retVal = 'stamps';
        
        this.state = {
          game: { terrain_selection: 'selection' },
          event: jasmine.createSpy('event')
        };
      }
    ]));

    when('user delete terrain', function() {
      this.ret = this.terrainModeService.actions
        .delete(this.state);
    }, function() {
      it('should execute deleteTerrainCommand', function() {
        expect(this.gameTerrainSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.state.event)
          .toHaveBeenCalledWith('Game.command.execute',
                                'deleteTerrain', ['stamps']);
      });
    });
  });

  describe('deleteTerrainCommand service', function() {
    beforeEach(inject([
      'deleteTerrainCommand',
      function(deleteTerrainCommandService) {
        this.deleteTerrainCommandService = deleteTerrainCommandService;

        this.terrainService = spyOnService('terrain');

        this.gameTerrainsService = spyOnService('gameTerrains');
        mockReturnPromise(this.gameTerrainsService.findAnyStamps);

        this.gameTerrainSelectionService = spyOnService('gameTerrainSelection');

        this.state = {
          factions: 'factions',
          changeEvent: jasmine.createSpy('changeEvent')
        };
        this.game = { terrains: 'terrains',
                      terrain_selection: 'selection' };
      }
    ]));

    when('execute(<stamps>, <state>, <game>)', function() {
      this.ret = this.deleteTerrainCommandService
        .execute(this.stamps, this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.stamps = ['stamp1', 'stamp2', 'stamp3'];

        this.terrains = [
          { state: { info: [ 'snow', 'hill', 'hill1' ],
                     x: 240, y: 240,
                     stamp: 'stamp1'
                   }
          },
          { state: { info: [ 'snow', 'hill', 'hill2' ],
                     x: 260, y: 240,
                     stamp: 'stamp2'
                   }
          },
          { state: { info: [ 'snow', 'wall', 'wall1' ],
                     x: 280, y: 240,
                     stamp: 'stamp3'
                   }
          }
        ];

        this.gameTerrainsService.findAnyStamps.resolveWith = this.terrains;
      });

      it('should find <stamps> in game terrains', function() {
        this.thenExpect(this.ret, function() {
          expect(this.gameTerrainsService.findAnyStamps)
            .toHaveBeenCalledWith(this.stamps, 'terrains');
        });
      });

      when('no stamps are found', function() {
        this.gameTerrainsService.findAnyStamps.rejectWith = 'reason';
      }, function() {
        it('should reject command', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('reason');
          });
        });
      });
      
      it('should remove terrains from <game> terrains', function() {
        this.thenExpect(this.ret, function([ctxt, game]) {
          expect(this.gameTerrainsService.removeStamps)
            .toHaveBeenCalledWith(this.stamps, 'terrains');
          expect(game.terrains)
            .toBe('gameTerrains.removeStamps.returnValue');
        });
      });

      it('should remove <ctxt.terrains> from terrainSelection', function() {
        this.thenExpect(this.ret, function() {
          expect(this.gameTerrainSelectionService.removeFrom)
            .toHaveBeenCalledWith('local', ['stamp1','stamp2','stamp3'],
                                  this.state, 'selection');
          expect(this.gameTerrainSelectionService.removeFrom)
            .toHaveBeenCalledWith('remote', ['stamp1','stamp2','stamp3'],
                                  this.state, 'gameTerrainSelection.removeFrom.returnValue');
        });
      });

      it('should emit createTerrain event', function() {
        this.thenExpect(this.ret, function() {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.terrain.create');
        });
      });

      it('should resolve context', function() {
        this.thenExpect(this.ret, function([ctxt]) {
          expect(this.terrainService.saveState)
            .toHaveBeenCalledWith({
              state: { info: [ 'snow', 'hill', 'hill1' ],
                       x: 240, y: 240,
                       stamp: 'stamp1'
                     }
            });
          expect(this.terrainService.saveState)
            .toHaveBeenCalledWith({
              state: { info: [ 'snow', 'hill', 'hill2' ],
                       x: 260, y: 240,
                       stamp: 'stamp2'
                     }
            });
          expect(this.terrainService.saveState)
            .toHaveBeenCalledWith({
              state: { info: [ 'snow', 'wall', 'wall1' ],
                       x: 280, y: 240,
                       stamp: 'stamp3'
                     }
            });
          expect(ctxt)
            .toEqual({
              terrains: [ 'terrain.saveState.returnValue',
                          'terrain.saveState.returnValue',
                          'terrain.saveState.returnValue' ],
              desc: ''
            });
        });
      });
    });

    when('replay(<ctxt>, <state>, <game>)', function() {
      this.ret = this.deleteTerrainCommandService
        .replay(this.ctxt, this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          terrains: [
            { info: [ 'snow', 'hill', 'hill1' ],
              x: 240, y: 240,
              stamp: 'stamp1'
            },
            { info: [ 'snow', 'hill', 'hill2' ],
              x: 260, y: 240,
              stamp: 'stamp2'
            },
            { info: [ 'snow', 'wall', 'wall1' ],
              x: 280, y: 240,
              stamp: 'stamp3'
            }
          ],
          desc: 'type'
        };
      });

      it('should remove <ctxt.terrains> from <game> terrains', function() {
        expect(this.gameTerrainsService.removeStamps)
          .toHaveBeenCalledWith(['stamp1','stamp2','stamp3'], 'terrains');
        expect(this.ret.terrains)
          .toBe('gameTerrains.removeStamps.returnValue');
      });

      it('should remove <ctxt.terrains> from terrainSelection', function() {
        expect(this.gameTerrainSelectionService.removeFrom)
          .toHaveBeenCalledWith('local', ['stamp1','stamp2','stamp3'],
                                this.state, 'selection');
        expect(this.gameTerrainSelectionService.removeFrom)
          .toHaveBeenCalledWith('remote', ['stamp1','stamp2','stamp3'],
                                this.state, 'gameTerrainSelection.removeFrom.returnValue');
      });

      it('should emit createTerrain event', function() {
        expect(this.state.changeEvent)
          .toHaveBeenCalledWith('Game.terrain.create');
      });
    });

    when('undo(<ctxt>, <state>, <game>)', function() {
      this.ret = this.deleteTerrainCommandService
        .undo(this.ctxt, this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          terrains: [
            { info: [ 'snow', 'hill', 'hill1' ],
              x: 240, y: 240,
              stamp: 'stamp1'
            },
            { info: [ 'snow', 'hill', 'hill2' ],
              x: 260, y: 240,
              stamp: 'stamp2'
            },
            { info: [ 'snow', 'wall', 'wall1' ],
              x: 280, y: 240,
              stamp: 'stamp3'
            }
          ],
          desc: 'type'
        };

        var stamp_index = 1;
        this.terrainService.create.and.callFake((m) => {
          return { state: R.assoc('stamp', 'stamp'+(stamp_index++), m) };
        });
      });

      it('should create new terrains from <ctxt.terrains>', function() {
        this.thenExpect(this.ret, function() {
          expect(this.terrainService.create)
            .toHaveBeenCalledWith({
              info: [ 'snow', 'hill', 'hill1' ],
              x: 240, y: 240,
              stamp: 'stamp1'
            });
          expect(this.terrainService.create)
            .toHaveBeenCalledWith({
              info: [ 'snow', 'hill', 'hill2' ],
              x: 260, y: 240,
              stamp: 'stamp2'
            });
          expect(this.terrainService.create)
            .toHaveBeenCalledWith({
              info: [ 'snow', 'wall', 'wall1' ],
              x: 280, y: 240,
              stamp: 'stamp3'
            });
        });
      });
      
      it('should add new terrain to <game> terrains', function() {
        this.thenExpect(this.ret, function(game) {
          expect(this.gameTerrainsService.add)
            .toHaveBeenCalledWith([
              { state: { info: [ 'snow', 'hill', 'hill1' ],
                         x: 240, y: 240,
                         stamp: 'stamp1'
                       }
              },
              { state: { info: [ 'snow', 'hill', 'hill2' ],
                         x: 260, y: 240,
                         stamp: 'stamp2'
                       }
              },
              { state: { info: [ 'snow', 'wall', 'wall1' ],
                         x: 280, y: 240,
                         stamp: 'stamp3'
                       }
              }
            ], 'terrains');
          
          expect(game.terrains)
            .toBe('gameTerrains.add.returnValue');
        });
      });

      it('should set remote terrainSelection to new terrains', function() {
        this.thenExpect(this.ret, function() {
          expect(this.gameTerrainSelectionService.set)
            .toHaveBeenCalledWith('remote', ['stamp1','stamp2','stamp3'],
                                  this.state, 'selection');
        });
      });

      it('should emit createTerrain event', function() {
        this.thenExpect(this.ret, function() {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.terrain.create');
        });
      });
    });
  });
});
