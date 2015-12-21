describe('misc terrain', function() {
  describe('onTerrainsCommand service', function() {
    beforeEach(inject([
      'onTerrainsCommand',
      function(onTerrainsCommandService) {
        this.onTerrainsCommandService = onTerrainsCommandService;
        this.terrainService = spyOnService('terrain');
        this.terrainService.eventName.and.callThrough();
        this.gameTerrainsService = spyOnService('gameTerrains');
        this.gameTerrainsService.findStamp.and.callFake((s) => {
          return { state: { stamp: s } };
        });
        this.gameTerrainSelectionService = spyOnService('gameTerrainSelection');

        this.scope = jasmine.createSpyObj('scope', [
          'gameEvent'
        ]);
        this.game = { terrains: 'terrains',
                      terrain_selection: 'selection' };
      }
    ]));

    when('execute(<method>, <..args..>, <stamps>, <scope>, <game>)', function() {
      this.ret = this.onTerrainsCommandService
        .execute(this.method, 'arg1', 'arg2', this.stamps, this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.stamps = ['stamp1', 'stamp2'];

        mockReturnPromise(this.gameTerrainsService.onStamps);
        this.gameTerrainsService.onStamps.resolveWith = (m) => {
          return this.gameTerrainsService.onStamps._retVal+'('+m+')';
        };
      });

      when('terrainService does not respond to <method> ', function() {
        this.method = 'whatever';
      }, function() {
        it('should reject command', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(this.gameTerrainsService.onStamps)
              .not.toHaveBeenCalled();

            expect(reason).toBe('Unknown method whatever on terrain');
          });
        });
      });
      
      when('terrainService responds to <method> ', function() {
        this.method = 'setState';
      }, function() {
        it('should save <stamps> states before change', function() {
          this.thenExpect(this.ret, function(ctxt) {
            expect(this.gameTerrainsService.onStamps)
              .toHaveBeenCalledWith('saveState', this.stamps, 'terrains');
            expect(ctxt.before)
              .toEqual('gameTerrains.onStamps.returnValue(saveState)');
          });
        });

        it('should apply <method> on <stamps>', function() {
          this.thenExpect(this.ret, function() {
            expect(this.gameTerrainsService.onStamps)
              .toHaveBeenCalledWith(this.method, 'arg1', 'arg2', this.stamps, 'terrains');
          });
        });

        it('should save <stamps> states after change', function() {
          this.thenExpect(this.ret, function(ctxt) {
            expect(this.gameTerrainsService.onStamps)
              .toHaveBeenCalledWith('saveState', this.stamps, 'terrains');
            expect(ctxt.after)
              .toEqual('gameTerrains.onStamps.returnValue(saveState)');
          });
        });

        it('should emit changeTerrain gameEvents', function() {
          this.thenExpect(this.ret, function() {
            expect(this.scope.gameEvent)
              .toHaveBeenCalledWith('changeTerrain-stamp1');
            expect(this.scope.gameEvent)
              .toHaveBeenCalledWith('changeTerrain-stamp2');
          });
        });

        it('should return context', function() {
          this.thenExpect(this.ret, function(ctxt) {
            expect(ctxt)
              .toEqual({
                before: 'gameTerrains.onStamps.returnValue(saveState)',
                after: 'gameTerrains.onStamps.returnValue(saveState)',
                desc: 'setState'
              });
          });
        });
      });
    });

    using([
      [ 'method', 'state'  ],
      [ 'replay', 'after'  ],
      [ 'undo'  , 'before' ],
    ], function(e) {
      when(e.method+'(<ctxt>, <scope>, <game>)', function() {
        this.ret = this.onTerrainsCommandService[e.method](this.ctxt, this.scope, this.game);
      }, function() {
        beforeEach(function() {
          this.ctxt = {
            before: [ { stamp: 'before1' }, { stamp: 'before2' } ],
            after: [ { stamp: 'after1' }, { stamp: 'after2' } ],
          };
          mockReturnPromise(this.gameTerrainsService.findAnyStamps);
          this.gameTerrainsService.findAnyStamps.resolveWith = function(ss) {
            return R.map(function(s) { return { state: { stamp: s } }; }, ss);
          };
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
        
        it('should find <stamps> in game terrains', function() {
          expect(this.gameTerrainsService.findAnyStamps)
            .toHaveBeenCalledWith([ e.state+'1', e.state+'2'], 'terrains');
        });

        it('should set <'+e.state+'> states', function() {
          this.thenExpect(this.ret, function() {
            expect(this.terrainService.setState)
              .toHaveBeenCalledWith({ stamp: e.state+'1' },
                                    { state: { stamp: e.state+'1' } });
            expect(this.terrainService.setState)
              .toHaveBeenCalledWith({ stamp: e.state+'2' },
                                    { state: { stamp: e.state+'2' } });
          });
        });

        it('should emit changeTerrain gameEvents', function() {
          this.thenExpect(this.ret, function() {
            expect(this.scope.gameEvent)
              .toHaveBeenCalledWith('changeTerrain-'+e.state+'1');
            expect(this.scope.gameEvent)
              .toHaveBeenCalledWith('changeTerrain-'+e.state+'2');
          });
        });

        it('should set remote terrainSelection to modified terrains', function() {
          this.thenExpect(this.ret, function() {
            expect(this.gameTerrainSelectionService.set)
              .toHaveBeenCalledWith('remote', [e.state+'1', e.state+'2'],
                                    this.scope, 'selection');
          });
        });
      });
    });
  });

  describe('gameTerrains service', function() {
    beforeEach(inject([
      'gameTerrains',
      function(gameTerrainsService) {
        this.gameTerrainsService = gameTerrainsService;
        this.terrainService = spyOnService('terrain');
        this.terrains = {
          active: [
            { state: { stamp: 'stamp1' } },
            { state: { stamp: 'stamp2' } },
          ],
          locked: [
            { state: { stamp: 'stamp3' } },
          ],
        };
      }
    ]));

    describe('findStamp(<stamp>)', function() {
      using([
        [ 'stamp' ],
        [ 'stamp2' ],
        [ 'stamp3' ],
      ], function(e) {
        it('should find <stamp> in terrains', function() {
          this.ret = this.gameTerrainsService.findStamp(e.stamp, this.terrains);
          
          this.thenExpect(this.ret, function(terrain) {
            expect(terrain).toEqual({ state: { stamp: e.stamp } });
          });
        });
      });

      describe('when <stamp> is not  found', function() {
        it('should reject result', function() {
          this.ret = this.gameTerrainsService.findStamp('unknown', this.terrains);
          
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toEqual('Terrain unknown not found');
          });
        });
      });
    });
    
    when('findAnyStamps(<stamps>)', function() {
      this.ret = this.gameTerrainsService
        .findAnyStamps(this.stamps, this.terrains);
    }, function() {
      when('some <stamps> exist', function() {
        this.stamps = ['stamp2', 'whatever', 'stamp3'];
      }, function() {
        it('should find stamps', function() {
          this.thenExpect(this.ret, function(terrains) {
            expect(terrains).toEqual([
              { state: { stamp: 'stamp2' } },
              null,
              { state: { stamp: 'stamp3' } },
            ]);
          });
        });
      });

      when('none of the <stamps> exist', function() {
        this.stamps = ['whatever', 'unknown'];
      }, function() {
        it('should reject result', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('No terrain found');
          });
        });
      });
    });
    
    when('onStamp(<method>, <...args...>, <stamps>)', function() {
      this.ret = this.gameTerrainsService.onStamps(this.method, 'arg1', 'arg2',
                                                 this.stamps, this.terrains);
    }, function() {
      beforeEach(function() {
        this.stamps = ['stamp2', 'stamp3'];

        mockReturnPromise(this.terrainService.setState);
        this.terrainService.setState.resolveWith = function(a1, a2, m) {
          return 'terrain.setState.returnValue('+m.state.stamp+')';
        };
      });

      when('terrainService does not respond to <method>', function() {
        this.method = 'whatever';
      }, function() {
        it('should reject method', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('Unknown method whatever on terrains');
          });
        });
      });
      
      when('terrainService responds to <method>', function() {
        this.method = 'setState';
      }, function() {
        when('none of the <stamps> are found', function() {
          this.stamps = ['whatever', 'unknown'];
        }, function() {
          it('should reject method', function() {
            this.thenExpectError(this.ret, function(reason) {
              expect(reason).toBe('No terrain found');
            });
          });
        });

        when('some <stamps> are found', function() {
          this.stamps = ['stamp2', 'whatever', 'stamp3'];
        }, function() {
          it('should call <method> on <stamp> terrain', function() {
            this.thenExpect(this.ret, function(result) {
              expect(this.terrainService[this.method])
                .toHaveBeenCalledWith('arg1', 'arg2',
                                      { state: { stamp: 'stamp2' } });
              expect(this.terrainService[this.method])
                .toHaveBeenCalledWith('arg1', 'arg2',
                                      { state: { stamp: 'stamp3' } });
              expect(result)
                .toEqual(['terrain.setState.returnValue(stamp2)',
                          'terrain.setState.returnValue(stamp3)']);
            });
          });

          when('some calls to <method> fail', function() {
            this.terrainService.setState.resolveWith = function(a1,a2,m) {
              return ( m.state.stamp === 'stamp2' ?
                       'terrain.setState.returnValue('+m.state.stamp+')' :
                       self.Promise.reject('reason')
                     );
            };
          }, function() {
            it('should return partial result', function() {
              this.thenExpect(this.ret, function(result) {
                expect(result).toEqual([
                  'terrain.setState.returnValue(stamp2)',
                  null
                ]);
              });
            });
          });

          when('all calls to <method> fail', function() {
            this.terrainService.setState.rejectWith = 'reason';
          }, function() {
            it('should reject method', function() {
              this.thenExpectError(this.ret, function(reason) {
                expect(reason).toBe('reason');
              });
            });
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
        this.gameFactionsService = spyOnService('gameFactions');
      }
    ]));

    describe('saveState()', function() {
      it('should return a copy of terrain\'s state', function() {
        var terrain = { state: { stamp: 'stamp' } };
        var ret = this.terrainService.saveState(terrain);
        expect(ret).toEqual({ stamp: 'stamp' });
        expect(ret).not.toBe(terrain.state);
      });
    });

    describe('setState(<state>)', function() {
      it('should set a copy of <state> as terrain\'s state', function() {
        var terrain = { state: null };
        var state = { stamp: 'stamp' };
        this.terrainService.setState(state, terrain);
        expect(terrain.state).toEqual(state);
        expect(terrain.state).not.toBe(state);
      });
    });
  });
});
