describe('terrain lock', function() {
  describe('terrainMode service', function() {
    beforeEach(inject([
      'terrainMode',
      function(terrainModeService) {
        this.terrainModeService = terrainModeService;

        this.gameService = spyOnService('game');

        this.gameTerrainsService = spyOnService('gameTerrains');
        mockReturnPromise(this.gameTerrainsService.findStamp);
        this.gameTerrainsService.findStamp
          .resolveWith = 'gameTerrains.findStamp.returnValue';

        this.gameTerrainSelectionService = spyOnService('gameTerrainSelection');
        this.gameTerrainSelectionService.get._retVal = ['stamp1','stamp2'];

        this.terrainService = spyOnService('terrain');
     
        this.state = { game: { terrains: 'terrains',
                               terrain_selection: 'selection' },
                       factions: 'factions',
                       event: jasmine.createSpy('event')
                     };
      }
    ]));

    when('user toggles lock on terrains', function() {
      this.ret = this.terrainModeService.actions
        .toggleLock(this.state);
    }, function() {
      using([
        ['first', 'set'],
        [ true  , false],
        [ false , true ],
      ], function(e, d) {
        when('first selected terrain\'s isLocked === '+e.first, function() {
          this.terrainService.isLocked._retVal = e.first;
        }, function() {
          it('should toggle lock on local selection, '+d, function() {
            expect(this.gameTerrainSelectionService.get)
              .toHaveBeenCalledWith('local', 'selection');
            expect(this.gameTerrainsService.findStamp)
              .toHaveBeenCalledWith('stamp1', 'terrains');
            this.thenExpect(this.ret, function() {
              expect(this.terrainService.isLocked)
                .toHaveBeenCalledWith('gameTerrains.findStamp.returnValue');
              expect(this.state.event)
                .toHaveBeenCalledWith('Game.command.execute',
                                      'lockTerrains', [ e.set,
                                                        this.gameTerrainSelectionService.get._retVal
                                                      ]);
            });
          });
        });
      });
    });
  });

  describe('lockTerrainsCommand service', function() {
    beforeEach(inject([
      'lockTerrainsCommand',
      function(lockTerrainsCommandService) {
        this.lockTerrainsCommandService = lockTerrainsCommandService;
        this.gameTerrainsService = spyOnService('gameTerrains');
        mockReturnPromise(this.gameTerrainsService.lockStamps);
        this.gameTerrainsService.lockStamps.resolveWith = 'gameTerrains.lockStamps.returnValue';
        
        this.state = jasmine.createSpyObj('state', [
          'changeEvent'
        ]);
        this.game = { terrains: 'terrains' };
      }
    ]));

    when('execute(<lock>, <stamps>, <state>, <game>)', function() {
      this.ret = this.lockTerrainsCommandService
        .execute('lock', this.stamps, this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.stamps = ['stamp1', 'stamp2'];
      });

      when('lockStamps fails', function() {
        this.gameTerrainsService.lockStamps.rejectWith = 'reason';
      }, function() {
        it('should reject command', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('reason');
          });
        });
      });
      
      it('should apply <lock> on <stamps>', function() {
        this.thenExpect(this.ret, function([ctxt,game]) {
          expect(this.gameTerrainsService.lockStamps)
            .toHaveBeenCalledWith('lock', this.stamps, 'terrains');
          expect(game.terrains)
            .toBe('gameTerrains.lockStamps.returnValue');
        });
      });

      it('should emit changeTerrain changeEvents', function() {
        this.thenExpect(this.ret, function() {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.terrain.change.stamp1');
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.terrain.change.stamp2');
        });
      });

      it('should return context', function() {
        this.thenExpect(this.ret, function([ctxt]) {
          expect(ctxt)
            .toEqual({
              stamps: this.stamps,
              desc: 'lock'
            });
        });
      });
    });

    when('replay(<ctxt>, <state>, <game>)', function() {
      this.ret = this.lockTerrainsCommandService
        .replay(this.ctxt, this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          stamps: [ 'stamp1', 'stamp2' ],
          desc: 'lock'
        };
      });

      when('lockStamps fails', function() {
        this.gameTerrainsService.lockStamps.rejectWith = 'reason';
      }, function() {
        it('should reject command', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('reason');
          });
        });
      });

      it('should apply <lock> on <stamps>', function() {
        this.thenExpect(this.ret, function(game) {
          expect(this.gameTerrainsService.lockStamps)
            .toHaveBeenCalledWith('lock', this.ctxt.stamps, 'terrains');
          expect(game.terrains)
            .toBe('gameTerrains.lockStamps.returnValue');
        });
      });

      it('should emit changeTerrain changeEvents', function() {
        this.thenExpect(this.ret, function() {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.terrain.change.stamp1');
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.terrain.change.stamp2');
        });
      });
    });

    when('undo(<ctxt>, <state>, <game>)', function() {
      this.ret = this.lockTerrainsCommandService
        .undo(this.ctxt, this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          stamps: [ 'stamp1', 'stamp2' ],
          desc: true
        };
      });

      when('lockStamps fails', function() {
        this.gameTerrainsService.lockStamps.rejectWith = 'reason';
      }, function() {
        it('should reject command', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('reason');
          });
        });
      });

      it('should apply !<lock> on <stamps>', function() {
        this.thenExpect(this.ret, function(game) {
          expect(this.gameTerrainsService.lockStamps)
            .toHaveBeenCalledWith(false, this.ctxt.stamps, 'terrains');
          expect(game.terrains)
            .toBe('gameTerrains.lockStamps.returnValue');
        });
      });

      it('should emit changeTerrain changeEvents', function() {
        this.thenExpect(this.ret, function() {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.terrain.change.stamp1');
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.terrain.change.stamp2');
        });
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

    describe('lockStamps(<lock>, <stamps>)', function() {
      beforeEach(function() {
        this.terrains = {
          active: [ { state: { stamp: 's1' } },
                    { state: { stamp: 's2' } } ],
          locked: [ { state: { stamp: 's3', lk: true } },
                    { state: { stamp: 's4', lk: true } } ]
        };
      });

      using([
        [ 'lock', 'stamps', 'result' ],
        [ true  , ['s1']  , { active: [ { state: { stamp: 's2' } } ],
                              locked: [ { state: { stamp: 's1', lk: true } },
                                        { state: { stamp: 's3', lk: true } },
                                        { state: { stamp: 's4', lk: true } } ]
                            } ],
        [ false , ['s1']  , { active: [ { state: { stamp: 's1', lk: false } },
                                        { state: { stamp: 's2' } } ],
                              locked: [ { state: { stamp: 's3', lk: true } },
                                        { state: { stamp: 's4', lk: true } } ]
                            } ],
        [ true  , ['s3']  , { active: [ { state: { stamp: 's1' } },
                                        { state: { stamp: 's2' } } ],
                              locked: [ { state: { stamp: 's3', lk: true } },
                                        { state: { stamp: 's4', lk: true } } ]
                            } ],
        [ false , ['s4']  , { active: [ { state: { stamp: 's4', lk: false } },
                                        { state: { stamp: 's1' } },
                                        { state: { stamp: 's2' } }
                                      ],
                              locked: [ { state: { stamp: 's3', lk: true } } ]
                            } ],
        [ true  , ['s2','s3'] , { active: [ { state: { stamp: 's1' } } ],
                                  locked: [ { state: { stamp: 's2', lk: true } },
                                            { state: { stamp: 's3', lk: true } },
                                            { state: { stamp: 's4', lk: true } } ]
                                } ],
        [ false , ['s1','s4'] , { active: [ { state: { stamp: 's1', lk: false } },
                                            { state: { stamp: 's4', lk: false } },
                                            { state: { stamp: 's2' } } ],
                                  locked: [ { state: { stamp: 's3', lk: true } } ]
                                } ],
      ], function(e, d) {
        it('should set lock for <stamps>, '+d, function() {
          this.ret = this.gameTerrainsService
            .lockStamps(e.lock, e.stamps, this.terrains);

          this.thenExpect(this.ret, function(result) {
            expect(result).toEqual(e.result);
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
      }
    ]));

    describe('setLock(<set>)', function() {
      it('should set lock for <terrain>', function() {
        this.terrain = { state: { dsp: [] } };
        
        this.terrain = this.terrainService.setLock(true, this.terrain);
        expect(this.terrainService.isLocked(this.terrain))
          .toBeTruthy();
        
        this.terrain = this.terrainService.setLock(false, this.terrain);
        expect(this.terrainService.isLocked(this.terrain))
          .toBeFalsy();
      });
    });
  });
});
