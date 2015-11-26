'use strict';

describe('drag model', function() {
  describe('modelMode service', function() {
    beforeEach(inject([
      'modelsMode',
      function(modelsModeService) {
        this.modelModeService = modelsModeService;

        this.gameService = spyOnService('game');
        this.modelService = spyOnService('model');
        this.modelService.saveState.and.callThrough();
        this.modelService.eventName.and.callThrough();
        this.gameModelsService = spyOnService('gameModels');
        this.gameModelSelectionService = spyOnService('gameModelSelection');

        this.scope = {
          game: { model_selection: 'selection',
                  models: [ { state: { stamp: 'stamp1', x: 240, y: 240, r: 180 } },
                            { state: { stamp: 'stamp2', x: 200, y: 300, r:  90 } } ]
                },
          modes: 'modes',
          factions: 'factions',
          gameEvent: jasmine.createSpy('gameEvent')
        };

        mockReturnPromise(this.gameService.executeCommand);
        this.gameService.executeCommand.resolveWith = 'game.executeCommand.returnValue';
        
        mockReturnPromise(this.gameModelsService.findAnyStamps);
        this.gameModelsService.findAnyStamps.resolveWith = function(ss, ms) {
          return R.map(function(s) {
            return R.find(R.pathEq(['state','stamp'], s), ms);
          }, ss);
        };

        mockReturnPromise(this.modelService.setPosition);
        this.modelService.setPosition.resolveWith = function(f, p, m) {
          return m;
        };
      }
    ]));

    when('user starts dragging model', function() {
      this.ret = this.modelModeService.actions
        .dragStartModel(this.scope, this.event);
    }, function() {
      beforeEach(function() {
        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 210, y: 201 },
        };

        this.gameModelSelectionService.get._retVal = ['stamp1','stamp2'];
        this.gameModelSelectionService.in._retVal = true;
      });

      when('target model is not in current selection', function() {
        this.gameModelSelectionService.in._retVal = false;
      }, function() {
        it('should set current selection', function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('setModelSelection', 'set', ['stamp'],
                                  this.scope, this.scope.game);
        });

        when('set current selection fails', function() {
          this.gameService.executeCommand.rejectWith = 'reason';
        }, function() {
          it('should reject drag', function() {
            this.thenExpectError(this.ret, function(reason) {
              expect(reason).toBe('reason');
              expect(this.modelService.setPosition)
                .not.toHaveBeenCalled();
              expect(this.scope.gameEvent)
                .not.toHaveBeenCalled();
            });
          });
        });
      });

      it('should get local model selection', function() {
        this.thenExpect(this.ret, function() {
          expect(this.gameModelSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
          expect(this.gameModelsService.findAnyStamps)
            .toHaveBeenCalledWith(['stamp1', 'stamp2'], this.scope.game.models);
        });
      });

      when('current selection is not found', function() {
        this.gameModelsService.findAnyStamps.rejectWith = 'reason';
      }, function() {
        it('should reject drag', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('reason');
            expect(this.modelService.setPosition)
              .not.toHaveBeenCalled();
            expect(this.scope.gameEvent)
              .not.toHaveBeenCalled();
          });
        });
      });
      
      it('should update selection positions', function() {
        this.thenExpect(this.ret, function() {
          expect(this.modelService.setPosition)
            .toHaveBeenCalledWith('factions',
                                  { x: 250, y: 241 },
                                  this.scope.game.models[0]);
          expect(this.modelService.setPosition)
            .toHaveBeenCalledWith('factions',
                                  { x: 210, y: 301 },
                                  this.scope.game.models[1]);
        });
      });

      when('update selection positions fails', function() {
        this.modelService.setPosition.rejectWith = 'reason';
      }, function() {
        it('should reject drag', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('reason');
            expect(this.scope.gameEvent)
              .not.toHaveBeenCalled();
          });
        });
      });
      
      it('should emit changeModel event', function() {
        this.thenExpect(this.ret, function() {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeModel-stamp1');
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeModel-stamp2');
        });
      });
    });

    when('user drags model', function() {
      this.ret = this.modelModeService.actions
        .dragModel(this.scope, this.event);
    }, function() {
      beforeEach(function(done) {
        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 210, y: 201 },
        };
        this.gameModelSelectionService.get._retVal = ['stamp1','stamp2'];
        this.gameModelSelectionService.in._retVal = true;
        this.modelModeService.actions
          .dragStartModel(this.scope, this.event)
          .then(R.bind(function() {
            this.modelService.setPosition.calls.reset();
            this.scope.gameEvent.calls.reset();
            done();
          }, this));

        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 230, y: 190 },
        };
      });

      it('should update target position', function() {
        this.thenExpect(this.ret, function() {
          expect(this.modelService.setPosition)
            .toHaveBeenCalledWith('factions',
                                  { x: 270, y: 230 },
                                  this.scope.game.models[0]);
          expect(this.modelService.setPosition)
            .toHaveBeenCalledWith('factions',
                                  { x: 230, y: 290 },
                                  this.scope.game.models[1]);
        });
      });

      when('update selection positions fails', function() {
        this.modelService.setPosition.rejectWith = 'reason';
      }, function() {
        it('should reject drag', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('reason');
            expect(this.scope.gameEvent)
              .not.toHaveBeenCalled();
          });
        });
      });

      it('should emit changeModel event', function() {
        this.thenExpect(this.ret, function() {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeModel-stamp1');
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeModel-stamp2');
        });
      });
    });

    when('user ends draging model', function() {
      this.ret = this.modelModeService.actions
        .dragEndModel(this.scope, this.event);
    }, function() {
      beforeEach(function(done) {
        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 210, y: 201 },
        };
        this.gameModelSelectionService.get._retVal = ['stamp1','stamp2'];
        this.gameModelSelectionService.in._retVal = true;
        this.modelModeService.actions
          .dragStartModel(this.scope, this.event)
          .then(R.bind(function() {
            this.scope.gameEvent.calls.reset();
            this.modelService.setPosition.calls.reset();
            done();
          }, this));

        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 230, y: 190 },
        };
      });

      it('should restore dragStart model position', function() {
        this.thenExpect(this.ret, function() {
          expect(this.modelService.setPosition)
            .toHaveBeenCalledWith('factions',
                                { stamp: 'stamp1', x: 240, y: 240, r: 180 },
                                  this.scope.game.models[0]);
          expect(this.modelService.setPosition)
            .toHaveBeenCalledWith('factions',
                                  { stamp: 'stamp2', x: 200, y: 300, r:  90 },
                                  this.scope.game.models[1]);
        });
      });

      when('update selection positions fails', function() {
        this.modelService.setPosition.rejectWith = 'reason';
      }, function() {
        it('should reject drag', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('reason');
            expect(this.gameService.executeCommand)
              .not.toHaveBeenCalled();
          });
        });
      });
      
      it('should execute onModels/shiftPosition command', function() {
        this.thenExpect(this.ret, function(result) {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onModels', 'shiftPosition', 'factions',
                                  { x: 30, y: -10 }, ['stamp1','stamp2'],
                                  this.scope, this.scope.game);
          expect(result).toBe('game.executeCommand.returnValue');
        });
      });
    });
  });

  describe('model service', function() {
    beforeEach(inject([
      'model',
      function(modelService) {
        this.modelService = modelService;
        spyOn(this.modelService, 'checkState')
          .and.returnValue('model.checkState.returnValue');
      }
    ]));

    when('setPosition(<pos>)', function() {
      this.ret = this.modelService
        .setPosition('factions', { x: 15, y: 42 }, this.model);
    }, function() {
      beforeEach(function() {
        this.model = {
          state: { stamp: 'stamp', info: 'info',
                   x: 240, y: 240, r: 180, dsp:[] }
        };
      });

      it('should set model position', function() {
        expect(R.pick(['x','y','r'], this.model.state))
          .toEqual({ x: 15, y: 42, r: 180 });
      });

      it('should check state', function() {
        expect(this.modelService.checkState)
          .toHaveBeenCalledWith('factions', null, this.model);
        expect(this.ret).toBe('model.checkState.returnValue');
      });

      when('model is locked', function() {
        this.modelService.setLock(true, this.model);
      }, function() {
        it('should reject move', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('Model stamp is locked');

            expect(R.pick(['x','y','r'], this.model.state))
              .toEqual({ x: 240, y: 240, r: 180 });
          });
        });
      });
    });

    when('shiftPosition(<pos>)', function() {
      this.ret = this.modelService
        .shiftPosition('factions', { x: 15, y: 20 }, this.model);
    }, function() {
      beforeEach(function() {
        this.model = {
          state: { stamp: 'stamp', info: 'info',
                   x: 440, y: 440, r: 180, dsp:[] }
        };
      });
      
      it('should set model position', function() {
        expect(R.pick(['x','y','r'], this.model.state))
          .toEqual({ x: 455, y: 460, r: 180 });
      });

      it('should check state', function() {
        expect(this.modelService.checkState)
          .toHaveBeenCalledWith('factions', null, this.model);
        expect(this.ret).toBe('model.checkState.returnValue');
      });

      when('model is locked', function() {
        this.modelService.setLock(true, this.model);
      }, function() {
        it('should reject move', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('Model stamp is locked');

            expect(R.pick(['x','y','r'], this.model.state))
              .toEqual({ x: 440, y: 440, r: 180 });
          });
        });
      });
    });
  });
});
