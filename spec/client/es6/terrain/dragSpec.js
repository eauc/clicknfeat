describe('drag terrain', function() {
  describe('terrainMode service', function() {
    beforeEach(inject([
      'terrainMode',
      function(terrainModeService) {
        this.terrainModeService = terrainModeService;

        this.gameService = spyOnService('game');

        this.terrainService = spyOnService('terrain');
        this.terrainService.saveState.and.callThrough();
        this.terrainService.eventName.and.callThrough();

        this.gameTerrainsService = spyOnService('gameTerrains');

        this.gameTerrainSelectionService = spyOnService('gameTerrainSelection');

        this.scope = {
          game: { terrain_selection: 'selection',
                  terrains: [ { state: { stamp: 'stamp1', x: 240, y: 240, r: 180 } },
                            { state: { stamp: 'stamp2', x: 200, y: 300, r:  90 } } ]
                },
          modes: 'modes',
          factions: 'factions',
          gameEvent: jasmine.createSpy('gameEvent')
        };

        mockReturnPromise(this.gameService.executeCommand);
        this.gameService.executeCommand.resolveWith = 'game.executeCommand.returnValue';
        
        mockReturnPromise(this.gameTerrainsService.findAnyStamps);
        this.gameTerrainsService.findAnyStamps.resolveWith = function(ss, ms) {
          return R.map(function(s) {
            return R.find(R.pathEq(['state','stamp'], s), ms);
          }, ss);
        };

        mockReturnPromise(this.terrainService.setPosition);
        this.terrainService.setPosition.resolveWith = function(f, t, p, m) {
          return m;
        };
      }
    ]));

    when('user starts dragging terrain', function() {
      this.ret = this.terrainModeService.actions
        .dragStartTerrain(this.scope, this.event);
    }, function() {
      beforeEach(function() {
        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 210, y: 201 }
        };

        this.gameTerrainSelectionService.get._retVal = ['stamp1'];
        this.gameTerrainSelectionService.in._retVal = true;
        this.terrainService.isLocked._retVal = false;
      });

      when('terrain is locked', function() {
        this.terrainService.isLocked._retVal = true;
      }, function() {
        it('should reject drag', function() {
          this.thenExpectError(this.ret, (reason) => {
            expect(reason).toBe('Terrain is locked');
          });
        });
      });
      
      it('should set current selection', function() {
        expect(this.gameTerrainSelectionService.set)
          .toHaveBeenCalledWith('local', ['stamp'],
                                this.scope, 'selection');
      });

      it('should update target position', function() {
        expect(R.pick(['x','y'], this.event.target.state))
            .toEqual({ x: 250, y: 241 });
      });
      
      it('should emit changeTerrain event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeTerrain-stamp');
      });
    });

    when('user drags terrain', function() {
      this.ret = this.terrainModeService.actions
        .dragTerrain(this.scope, this.event);
    }, function() {
      beforeEach(function() {
        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 210, y: 201 }
        };

        this.gameTerrainSelectionService.get._retVal = ['stamp'];
        this.gameTerrainSelectionService.in._retVal = true;
        this.terrainService.isLocked._retVal = false;
        this.terrainModeService.actions
          .dragStartTerrain(this.scope, this.event);

        this.terrainService.setPosition.calls.reset();
        this.scope.gameEvent.calls.reset();

        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 230, y: 190 }
        };
      });

      when('terrain is locked', function() {
        this.terrainService.isLocked._retVal = true;
      }, function() {
        it('should reject drag', function() {
          this.thenExpectError(this.ret, (reason) => {
            expect(reason).toBe('Terrain is locked');
          });
        });
      });

      it('should update target position', function() {
        expect(R.pick(['x','y'], this.event.target.state))
            .toEqual({ x: 270, y: 230 });
      });

      it('should emit changeTerrain event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeTerrain-stamp');
      });
    });

    when('user ends draging terrain', function() {
      this.ret = this.terrainModeService.actions
        .dragEndTerrain(this.scope, this.event);
    }, function() {
      beforeEach(function() {
        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 210, y: 201 }
        };

        this.gameTerrainSelectionService.get._retVal = ['stamp'];
        this.gameTerrainSelectionService.in._retVal = true;
        this.terrainService.isLocked._retVal = false;
        this.terrainModeService.actions
          .dragStartTerrain(this.scope, this.event);

        this.scope.gameEvent.calls.reset();
        this.terrainService.setPosition.calls.reset();

        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 230, y: 190 }
        };
      });

      when('terrain is locked', function() {
        this.terrainService.isLocked._retVal = true;
      }, function() {
        it('should reject drag', function() {
          this.thenExpectError(this.ret, (reason) => {
            expect(reason).toBe('Terrain is locked');
          });
        });
      });

      it('should restore dragStart terrain position', function() {
        expect(R.pick(['x','y'], this.event.target.state))
            .toEqual({ x: 240, y: 240 });
      });

      it('should execute onTerrains/setPosition command', function() {
        this.thenExpect(this.ret, function(result) {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onTerrains',
                                  'setPosition', { stamp: 'stamp', x: 270, y: 230, r: 180 },
                                  ['stamp'], this.scope, this.scope.game);
          expect(result).toBe('game.executeCommand.returnValue');
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
      }
    ]));

    when('setPosition(<pos>)', function() {
      this.ret = this.terrainService
        .setPosition({ x: 15, y: 42 }, this.terrain);
    }, function() {
      beforeEach(function() {
        this.terrain = {
          state: { stamp: 'stamp', info: 'info',
                   x: 240, y: 240, r: 180, dsp:[] }
        };
      });

      it('should set terrain position', function() {
        expect(R.pick(['x','y','r'], this.terrain.state))
          .toEqual({ x: 15, y: 42, r: 180 });
      });

      it('should check state', function() {
        expect(this.terrainService.checkState)
          .toHaveBeenCalledWith(this.terrain);
        expect(this.ret).toBe('terrain.checkState.returnValue');
      });

      when('terrain is locked', function() {
        this.terrainService.setLock(true, this.terrain);
      }, function() {
        it('should reject move', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('Terrain is locked');

            expect(R.pick(['x','y','r'], this.terrain.state))
              .toEqual({ x: 240, y: 240, r: 180 });
          });
        });
      });
    });

    when('shiftPosition(<pos>)', function() {
      this.ret = this.terrainService
        .shiftPosition({ x: 15, y: 20 }, this.terrain);
    }, function() {
      beforeEach(function() {
        this.terrain = {
          state: { stamp: 'stamp', info: 'info',
                   x: 440, y: 440, r: 180, dsp:[] }
        };
        this.target = 'target';
      });
      
      it('should set terrain position', function() {
        expect(R.pick(['x','y','r'], this.terrain.state))
          .toEqual({ x: 455, y: 460, r: 180 });
      });

      it('should check state', function() {
        expect(this.terrainService.checkState)
          .toHaveBeenCalledWith(this.terrain);
        expect(this.ret).toBe('terrain.checkState.returnValue');
      });

      when('terrain is locked', function() {
        this.terrainService.setLock(true, this.terrain);
      }, function() {
        it('should reject move', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('Terrain is locked');

            expect(R.pick(['x','y','r'], this.terrain.state))
              .toEqual({ x: 440, y: 440, r: 180 });
          });
        });
      });
    });
  });
});
