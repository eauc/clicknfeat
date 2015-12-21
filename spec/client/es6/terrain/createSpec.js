describe('create terrain', function() {
  describe('createTerrainMode service', function() {
    beforeEach(inject([
      'createTerrainMode',
      function(createTerrainModeService) {
        this.createTerrainModeService = createTerrainModeService;

        this.gameService = spyOnService('game');

        this.scope = jasmine.createSpyObj('scope', [
          'gameEvent'
        ]);
        this.scope.create = { terrain: { base: {} } };
        this.game = 'game';
      }
    ]));

    describe('onEnter()', function() {
      beforeEach(function() {
        this.createTerrainModeService.onEnter(this.scope);
      });

      using([
        [ 'event' ],
        [ 'enableCreateTerrain' ],
        [ 'enableMoveMap' ],
      ], function(e) {
        it('should emit '+e.event+' event', function() {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith(e.event);
        });
      });
    });

    when('user move mouse over map', function() {
      this.createTerrainModeService.actions
        .moveMap(this.scope, { x: 42, y: 71 });
    }, function() {
      it('should update scope\'s create object', function() {
        expect(this.scope.create.terrain.base)
          .toEqual({
            x: 42, y: 71
          });
      });

      it('should emit moveCreateTerrain event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('moveCreateTerrain');
      });
    });

    when('user create terrain', function() {
      this.ret = this.createTerrainModeService.actions
        .create(this.scope, { 'click#': { x: 42, y: 71 } });
    }, function() {
      it('should update scope\'s create object', function() {
        expect(this.scope.create.terrain.base)
          .toEqual({
            x: 42, y: 71
          });
      });

      using([
        [ 'flip_map' ],
        [ true       ],
        [ false      ],
      ], function(e) {
        when('map is '+(e.flip_map ? '' : 'not ')+'flipped', function() {
          this.scope.ui_state = { flip_map: e.flip_map };
        }, function() {
          it('should execute createTerrainCommand', function() {
            expect(this.gameService.executeCommand)
              .toHaveBeenCalledWith('createTerrain',
                                    this.scope.create.terrain, e.flip_map,
                                    this.scope, this.scope.game);

            expect(this.ret).toBe('game.executeCommand.returnValue');
          });
        });
      });
    });

    describe('onLeave()', function() {
      beforeEach(function() {
        this.createTerrainModeService.onLeave(this.scope);
      });

      it('should reset scope\'s create object', function() {
        expect(this.scope.create)
          .toEqual({ terrain: null });
      });

      using([
        [ 'event' ],
        [ 'disableCreateTerrain' ],
        [ 'disableMoveMap' ],
      ], function(e) {
        it('should emit '+e.event+' event', function() {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith(e.event);
        });
      });
    });
  });

  describe('createTerrainCommand service', function() {
    beforeEach(inject([
      'createTerrainCommand',
      function(createTerrainCommandService) {
        this.createTerrainCommandService = createTerrainCommandService;

        this.terrainService = spyOnService('terrain');

        this.gameTerrainsService = spyOnService('gameTerrains');

        this.gameTerrainSelectionService = spyOnService('gameTerrainSelection');

        this.scope = {
          factions: 'factions',
          gameEvent: jasmine.createSpy('gameEvent')
        };
        this.game = { terrains: 'terrains',
                      terrain_selection: 'selection' };

        var stamp_index = 1;
        this.terrainService.create.and.callFake((m) => {
          return { state: R.assoc('stamp', 'stamp'+(stamp_index++), m) };
        });
      }
    ]));

    when('execute(<create>, <flip>, <scope>, <game>)', function() {
      this.ret = this.createTerrainCommandService
        .execute(this.create, this.flip, this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.create = {
          base: { x: 240, y: 240, r: 180 },
          terrains: [ {
            info: ['snow','hill','hill1'],
            x: 0, y: 0, r: 45,
            lk: true
          }, {
            info: ['snow','hill','hill2'],
            x: 20, y: 0, r: 0
          }, {
            info: ['grass','wall','wall1'],
            x: 40, y: 0, r: -45,
            lk: false
          } ]
        };
        this.flip = false;
      });

      it('should create new terrains from <create>', function() {
        this.thenExpect(this.ret, function() {
          expect(this.terrainService.create)
            .toHaveBeenCalledWith({
              info: ['snow','hill','hill1'],
              x: 240, y: 240, r: 225,
              lk: true
            });
          expect(this.terrainService.create)
            .toHaveBeenCalledWith({
              info: ['snow','hill','hill2'],
              x: 260, y: 240, r: 180
            });
          expect(this.terrainService.create)
            .toHaveBeenCalledWith({
              info: ['grass','wall','wall1'],
              x: 280, y: 240, r: 135,
              lk: false
            });
        });
      });

      when('map is flipped', function() {
        this.flip = true;
      }, function() {
        it('should flip new terrains positions', function() {
          this.thenExpect(this.ret, function() {
            expect(this.terrainService.create)
              .toHaveBeenCalledWith({
                info: ['snow','hill','hill1'],
                x: 240, y: 240, r: 405,
                lk: true
              });
            expect(this.terrainService.create)
              .toHaveBeenCalledWith({
                info: ['snow','hill','hill2'],
                x: 220, y: 240, r: 360
              });
            expect(this.terrainService.create)
              .toHaveBeenCalledWith({
                info: ['grass','wall','wall1'],
                x: 200, y: 240, r: 315,
                lk: false
              });
          });
        });
      });

      it('should add new terrain to <game> terrains', function() {
        this.thenExpect(this.ret, function() {
          expect(this.gameTerrainsService.add)
            .toHaveBeenCalledWith([
              { state: { info: ['snow','hill','hill1'],
                         x: 240, y: 240, r: 225,
                         lk: true,
                         stamp: 'stamp1'
                       }
              },
              { state: { info: ['snow','hill','hill2'],
                         x: 260, y: 240, r: 180,
                         stamp: 'stamp2'
                       }
              },
              { state: { info: ['grass','wall','wall1'],
                         x: 280, y: 240, r: 135,
                         lk: false,
                         stamp: 'stamp3'
                       }
              }
            ], 'terrains');
          expect(this.game.terrains)
            .toBe('gameTerrains.add.returnValue');
        });
      });

      it('should set local terrainSelection to new terrain', function() {
        this.thenExpect(this.ret, function() {
          expect(this.gameTerrainSelectionService.set)
            .toHaveBeenCalledWith('local', ['stamp1', 'stamp2', 'stamp3'],
                                  this.scope, 'selection');
        });
      });

      it('should emit createTerrain event', function() {
        this.thenExpect(this.ret, function() {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('createTerrain');
        });
      });

      it('should return context', function() {
        this.thenExpect(this.ret, function(ctxt) {
          expect(this.terrainService.saveState)
            .toHaveBeenCalledWith({
              state: { info: ['snow','hill','hill1'],
                       x: 240, y: 240, r: 225,
                       lk: true,
                       stamp: 'stamp1'
                     }
            });
          expect(this.terrainService.saveState)
            .toHaveBeenCalledWith({
              state: { info: ['snow','hill','hill2'],
                       x: 260, y: 240, r: 180,
                       stamp: 'stamp2'
                     }
            });
          expect(this.terrainService.saveState)
            .toHaveBeenCalledWith({
              state: { info: ['grass','wall','wall1'],
                       x: 280, y: 240, r: 135,
                       lk: false,
                       stamp: 'stamp3'
                     }
            });

          expect(ctxt)
            .toEqual({
              terrains: [ 'terrain.saveState.returnValue',
                          'terrain.saveState.returnValue',
                          'terrain.saveState.returnValue' ],
              desc: 'snow.hill.hill1'
            });
        });
      });
    });

    when('replay(<ctxt>, <scope>, <game>)', function() {
      this.ret = this.createTerrainCommandService
        .replay(this.ctxt, this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          terrains: [
            { info: [ 'snow', 'hill', 'hill1' ],
              x: 240, y: 240,
              lk: true,
              stamp: 'stamp'
            },
            { info: [ 'snow', 'hill', 'hill2' ],
              x: 260, y: 240,
              stamp: 'stamp'
            },
            { info: [ 'snow', 'wall', 'wall1' ],
              x: 280, y: 240,
              lk: false,
              stamp: 'stamp'
            }
          ],
          desc: 'type'
        };
      });

      it('should create new terrains from <ctxt.terrains>', function() {
        this.thenExpect(this.ret, function() {
          expect(this.terrainService.create)
            .toHaveBeenCalledWith({
              info: [ 'snow', 'hill', 'hill1' ],
              x: 240, y: 240,
              lk: true,
              stamp: 'stamp'
            });
          expect(this.terrainService.create)
            .toHaveBeenCalledWith({
              info: [ 'snow', 'hill', 'hill2' ],
              x: 260, y: 240,
              stamp: 'stamp'
            });
          expect(this.terrainService.create)
            .toHaveBeenCalledWith({
              info: [ 'snow', 'wall', 'wall1' ],
              x: 280, y: 240,
              lk: false,
              stamp: 'stamp'
            });
        });
      });

      it('should add new terrain to <game> terrains', function() {
        this.thenExpect(this.ret, function() {
          expect(this.gameTerrainsService.add)
            .toHaveBeenCalledWith([
              { state: { info: [ 'snow', 'hill', 'hill1' ],
                         x: 240, y: 240,
                         lk: true,
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
                         lk: false,
                         stamp: 'stamp3'
                       }
              }
            ], 'terrains');
          expect(this.game.terrains)
            .toBe('gameTerrains.add.returnValue');
        });
      });

      it('should set remote terrainSelection to new terrain', function() {
        this.thenExpect(this.ret, function() {
          expect(this.gameTerrainSelectionService.set)
            .toHaveBeenCalledWith('remote', ['stamp1','stamp2','stamp3'],
                                  this.scope, 'selection');
        });
      });

      it('should emit createTerrain event', function() {
        this.thenExpect(this.ret, function() {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('createTerrain');
        });
      });
    });

    describe('undo(<ctxt>, <scope>, <game>)', function() {
      beforeEach(function() {
        this.ctxt = {
          terrains: [
            { info: [ 'snow', 'hill', 'hill1' ],
              x: 240, y: 240,
              lk: true,
              stamp: 'stamp1'
            },
            { info: [ 'snow', 'hill', 'hill2' ],
              x: 260, y: 240,
              stamp: 'stamp2'
            },
            { info: [ 'snow', 'wall', 'wall1' ],
              x: 280, y: 240,
              lk: false,
              stamp: 'stamp3'
            }
          ],
          desc: 'type'
        };

        this.createTerrainCommandService
          .undo(this.ctxt, this.scope, this.game);
      });

      it('should remove <ctxt.terrain> from <game> terrains', function() {
        expect(this.gameTerrainsService.removeStamps)
          .toHaveBeenCalledWith(['stamp1','stamp2','stamp3'], 'terrains');
        expect(this.game.terrains)
          .toBe('gameTerrains.removeStamps.returnValue');
      });

      it('should remove <ctxt.terrain> from terrainSelection', function() {
        expect(this.gameTerrainSelectionService.removeFrom)
          .toHaveBeenCalledWith('local', ['stamp1','stamp2','stamp3'],
                                this.scope, 'selection');
        expect(this.gameTerrainSelectionService.removeFrom)
          .toHaveBeenCalledWith('remote', ['stamp1','stamp2','stamp3'],
                                this.scope, 'gameTerrainSelection.removeFrom.returnValue');
      });

      it('should emit createTerrain event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('createTerrain');
      });
    });
  });

  describe('gameTerrains service', function() {
    beforeEach(inject([
      'gameTerrains',
      function(gameTerrainsService) {
        this.gameTerrainsService = gameTerrainsService;
      }
    ]));

    describe('add(<terrains>)', function() {
      beforeEach(function() {
        this.terrains = {
          active: [ { state: { stamp: 'other1', x: 1 } } ],
          locked: [ { state: { stamp: 'other2', x: 1, lk: true } } ]
        };
      });

      using([
        [ 'new', 'result' ],
        [ [ { state: { stamp: 'new1' } },
            { state: { stamp: 'new2' } } ],
          { active: [ { state: { stamp: 'other1', x: 1 } },
                      { state: { stamp: 'new1' } },
                      { state: { stamp: 'new2' } } ],
            locked: [ { state: { stamp: 'other2', x: 1, lk: true } } ]
          }
        ],
        // remove other identics stamps
        [ [ { state: { stamp: 'other1' } },
            { state: { stamp: 'other2' } },
            { state: { stamp: 'new2' } } ],
          { active: [ { state: { stamp: 'other1' } },
                      { state: { stamp: 'other2' } },
                      { state: { stamp: 'new2' } } ],
            locked: []
          }
        ],
        // refresh active/locked
        [ [ { state: { stamp: 'new1' } },
            { state: { stamp: 'new2', lk: true } } ],
          { active: [ { state: { stamp: 'other1', x: 1 } },
                      { state: { stamp: 'new1' } } ],
            locked: [ { state: { stamp: 'new2', lk: true } },
                      { state: { stamp: 'other2', x: 1, lk: true } } ]
          }
        ],
      ], function(e, d) {
        it('should add <terrain> to active terrains list, '+d, function() {
          expect(this.gameTerrainsService.add(e.new, this.terrains))
            .toEqual(e.result);
        });
      });
    });
    
    describe('removeStamps(<terrain>)', function() {
      beforeEach(function() {
        this.terrains = {
          active: [ { state: { stamp: 'active1' } },
                    { state: { stamp: 'active2' } },
                  ],
          locked: [ { state: { stamp: 'locked1', lk: true } },
                    { state: { stamp: 'locked2', lk: true } },
                  ]
        };
      });

      using([
        [ 'stamps', 'result' ],
        [ [ 'active1', 'active2' ],
          { active: [ ],
            locked: [ { state: { stamp: 'locked1', lk: true } },
                      { state: { stamp: 'locked2', lk: true } }
                    ]
          }
        ],
        [ [ 'locked1', 'active1' ],
          { active: [ { state: { stamp: 'active2' } } ],
            locked: [ { state: { stamp: 'locked2', lk: true } } ]
          }
        ],
        [ [ 'unknwown', 'active1' ],
          { active: [ { state: { stamp: 'active2' } } ],
            locked: [ { state: { stamp: 'locked1', lk: true } },
                      { state: { stamp: 'locked2', lk: true } }
                    ]
          }
        ]
      ], function(e, d) {
        it('should remove <stamp> from terrains list, '+d, function() {
          expect(this.gameTerrainsService.removeStamps(e.stamps, this.terrains))
            .toEqual(e.result);
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
          .and.returnValue('terrain.checkState.returnValue');

        spyOn(R, 'guid').and.returnValue('newGuid');
      }
    ]));

    when('create(<state>)', function() {
      this.ret = this.terrainService.create(this.state);
    }, function() {     
      beforeEach(function() {
        this.state = { info: ['info'],
                       x:240,
                       lk: true,
                       stamp: 'stamp'
                     };
      });

      it('should check <state>', function() {
        expect(this.terrainService.checkState)
          .toHaveBeenCalledWith({
            state: { x: 240, y: 0, r: 0,
                     lk: true,
                     stamp: 'stamp',
                     info: [ 'info' ]
                   }
          });
        expect(this.ret).toBe('terrain.checkState.returnValue');
      });
    });
  });
});
