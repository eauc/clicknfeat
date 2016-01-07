describe('drag model', function() {
  describe('modelsMode service', function() {
    beforeEach(inject([
      'modelsMode',
      function(modelsModeService) {
        this.modelsModeService = modelsModeService;

        this.modelService = spyOnService('model');
        this.modelService.saveState.and.callThrough();
        this.modelService.eventName.and.callThrough();
        this.gameModelsService = spyOnService('gameModels');
        this.gameModelSelectionService = spyOnService('gameModelSelection');

        this.state = {
          game: { model_selection: 'selection',
                  models: [ { state: { stamp: 'stamp1', x: 240, y: 240, r: 180 } },
                            { state: { stamp: 'stamp2', x: 200, y: 300, r:  90 } } ]
                },
          modes: 'modes',
          factions: 'factions',
          changeEvent: jasmine.createSpy('changeEvent'),
          event: jasmine.createSpy('event')
        };
        
        mockReturnPromise(this.gameModelsService.findAnyStamps);
        this.gameModelsService.findAnyStamps.resolveWith = function(ss, ms) {
          return R.map(function(s) {
            return R.find(R.pathEq(['state','stamp'], s), ms);
          }, ss);
        };

        mockReturnPromise(this.modelService.setPosition);
        this.modelService.setPosition.resolveWith = function(f, t, p, m) {
          return m;
        };
        mockReturnPromise(this.modelService.setPosition_);
        this.modelService.setPosition_.resolveWith = function(f, t, p, m) {
          return m;
        };
        mockReturnPromise(this.modelService.chargeTarget);
        this.modelService.chargeTarget.resolveWith = 'model.chargeTarget.returnValue';
      }
    ]));

    when('user starts dragging model', function() {
      this.ret = this.modelsModeService.actions
        .dragStartModel(this.state, this.event);
    }, function() {
      beforeEach(function() {
        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 210, y: 201 }
        };

        this.gameModelSelectionService.get._retVal = ['stamp1','stamp2'];
        this.gameModelSelectionService.in._retVal = true;
      });

      when('target model is not in current selection', function() {
        this.gameModelSelectionService.in._retVal = false;
      }, function() {
        it('should set current selection', function() {
          this.thenExpect(this.ret, () => {
            expect(this.state.event)
              .toHaveBeenCalledWith('Game.command.execute',
                                    'setModelSelection', ['set', ['stamp']]);
          });
        });
      });

      it('should get local model selection', function() {
        this.thenExpect(this.ret, function() {
          expect(this.gameModelSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
          expect(this.gameModelsService.findAnyStamps)
            .toHaveBeenCalledWith(['stamp1', 'stamp2'], this.state.game.models);
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
            expect(this.state.changeEvent)
              .not.toHaveBeenCalled();
          });
        });
      });

      when('selection is a single model', function() {
        this.gameModelSelectionService.get._retVal = ['stamp1'];
      }, function() {
        it('should get charge target', function() {
          this.thenExpect(this.ret, function() {
            expect(this.modelService.chargeTarget)
              .toHaveBeenCalledWith(this.state.game.models[0]);
          });
        });

        when('no charge target is set', function() {
          this.modelService.chargeTarget.rejectWith = 'reason';
        }, function() {
          it('should update selection positions without target', function() {
            this.thenExpect(this.ret, function() {
              expect(this.gameModelsService.findStamp)
                .not.toHaveBeenCalled();
              expect(this.modelService.setPosition_)
                .toHaveBeenCalledWith('factions',
                                      null, 
                                      { x: 250, y: 241 },
                                      this.state.game.models[0]);
            });
          });
        });

        it('should update selection positions with target', function() {
          this.thenExpect(this.ret, function() {
            expect(this.gameModelsService.findStamp)
              .toHaveBeenCalledWith('model.chargeTarget.returnValue',
                                    this.state.game.models);
            expect(this.modelService.setPosition_)
              .toHaveBeenCalledWith('factions',
                                    'gameModels.findStamp.returnValue', 
                                    { x: 250, y: 241 },
                                    this.state.game.models[0]);
          });
        });
      });
      
      it('should update selection positions', function() {
        this.thenExpect(this.ret, function() {
          expect(this.modelService.setPosition_)
            .toHaveBeenCalledWith('factions',
                                  null, 
                                  { x: 250, y: 241 },
                                  this.state.game.models[0]);
          expect(this.modelService.setPosition_)
            .toHaveBeenCalledWith('factions',
                                  null, 
                                  { x: 210, y: 301 },
                                  this.state.game.models[1]);
        });
      });

      when('update selection positions fails', function() {
        this.modelService.setPosition_.rejectWith = 'reason';
      }, function() {
        it('should reject drag', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('reason');
            expect(this.state.changeEvent)
              .not.toHaveBeenCalled();
          });
        });
      });
      
      it('should emit changeModel event', function() {
        this.thenExpect(this.ret, function() {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.model.change.stamp1');
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.model.change.stamp2');
        });
      });
    });

    when('user drags model', function() {
      this.ret = this.modelsModeService.actions
        .dragModel(this.state, this.event);
    }, function() {
      beforeEach(function(done) {
        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 210, y: 201 }
        };
        this.gameModelSelectionService.get._retVal = ['stamp1','stamp2'];
        this.gameModelSelectionService.in._retVal = true;
        this.modelsModeService.actions
          .dragStartModel(this.state, this.event)
          .then(() => {
            this.modelService.setPosition_.calls.reset();
            this.state.changeEvent.calls.reset();
            done();
          });

        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 230, y: 190 }
        };
      });

      it('should update target position', function() {
        this.thenExpect(this.ret, function() {
          expect(this.modelService.setPosition_)
            .toHaveBeenCalledWith('factions',
                                  null,
                                  { x: 270, y: 230 },
                                  this.state.game.models[0]);
          expect(this.modelService.setPosition_)
            .toHaveBeenCalledWith('factions',
                                  null,
                                  { x: 230, y: 290 },
                                  this.state.game.models[1]);
        });
      });

      when('update selection positions fails', function() {
        this.modelService.setPosition_.rejectWith = 'reason';
      }, function() {
        it('should reject drag', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('reason');
            expect(this.state.changeEvent)
              .not.toHaveBeenCalled();
          });
        });
      });

      it('should emit changeModel event', function() {
        this.thenExpect(this.ret, function() {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.model.change.stamp1');
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.model.change.stamp2');
        });
      });
    });

    when('user ends draging model', function() {
      this.ret = this.modelsModeService.actions
        .dragEndModel(this.state, this.event);
    }, function() {
      beforeEach(function(done) {
        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 210, y: 201 }
        };
        this.gameModelSelectionService.get._retVal = ['stamp1','stamp2'];
        this.gameModelSelectionService.in._retVal = true;
        this.modelsModeService.actions
          .dragStartModel(this.state, this.event)
          .then(() => {
            this.state.changeEvent.calls.reset();
            this.modelService.setPosition_.calls.reset();
            done();
          });

        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 230, y: 190 }
        };
      });

      it('should restore dragStart model position', function() {
        this.thenExpect(this.ret, function() {
          expect(this.modelService.setPosition_)
            .toHaveBeenCalledWith('factions',
                                  null,
                                  { stamp: 'stamp1', x: 240, y: 240, r: 180 },
                                  this.state.game.models[0]);
          expect(this.modelService.setPosition_)
            .toHaveBeenCalledWith('factions',
                                  null,
                                  { stamp: 'stamp2', x: 200, y: 300, r:  90 },
                                  this.state.game.models[1]);
        });
      });

      when('update selection positions fails', function() {
        this.modelService.setPosition_.rejectWith = 'reason';
      }, function() {
        it('should reject drag', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('reason');
            expect(this.state.event)
              .not.toHaveBeenCalled();
          });
        });
      });
      
      it('should execute onModels/shiftPosition command', function() {
        this.thenExpect(this.ret, function() {
          expect(this.state.event)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onModels', [ 'shiftPosition',
                                                ['factions', null, { x: 30, y: -10 }],
                                                ['stamp1','stamp2']
                                              ]);
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
          .and.callFake((f,t,m) => m);
      }
    ]));

    when('setPosition(<pos>)', function() {
      this.ret = this.modelService
        .setPosition('factions', this.target, { x: 15, y: 42 }, this.model);
    }, function() {
      beforeEach(function() {
        this.model = {
          state: { stamp: 'stamp', info: 'info',
                   x: 240, y: 240, r: 180, dsp:[] }
        };
        this.target = 'target';
      });

      it('should set model position', function() {
        expect(R.pick(['x','y','r'], this.ret.state))
          .toEqual({ x: 15, y: 42, r: 180 });
      });

      it('should check state', function() {
        expect(this.modelService.checkState)
          .toHaveBeenCalledWith('factions', 'target', this.ret);
      });

      when('model is locked', function() {
        this.model = this.modelService.setLock(true, this.model);
      }, function() {
        it('should reject move', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('Model is locked');
          });
        });
      });
    });

    when('setPosition_(<pos>)', function() {
      this.ret = this.modelService
        .setPosition_('factions', this.target, { x: 15, y: 42 }, this.model);
    }, function() {
      beforeEach(function() {
        this.model = {
          state: { stamp: 'stamp', info: 'info',
                   x: 240, y: 240, r: 180, dsp:[] }
        };
        this.target = 'target';
      });

      it('should modify model position', function() {
        this.thenExpect(this.ret, () => {
          expect(R.pick(['x','y','r'], this.model.state))
            .toEqual({ x: 15, y: 42, r: 180 });
        });
      });

      it('should check state', function() {
        this.thenExpect(this.ret, () => {
          expect(this.modelService.checkState)
            .toHaveBeenCalledWith('factions', 'target', this.model);
        });
      });

      when('model is locked', function() {
        this.model = this.modelService.setLock(true, this.model);
      }, function() {
        it('should reject move', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('Model is locked');
          });
        });
      });
    });

    when('shiftPosition(<pos>)', function() {
      this.ret = this.modelService
        .shiftPosition('factions', this.target, { x: 15, y: 20 }, this.model);
    }, function() {
      beforeEach(function() {
        this.model = {
          state: { stamp: 'stamp', info: 'info',
                   x: 440, y: 440, r: 180, dsp:[] }
        };
        this.target = 'target';
      });
      
      it('should set model position', function() {
        expect(R.pick(['x','y','r'], this.ret.state))
          .toEqual({ x: 455, y: 460, r: 180 });
      });

      it('should check state', function() {
        expect(this.modelService.checkState)
          .toHaveBeenCalledWith('factions', 'target', this.ret);
      });

      when('model is locked', function() {
        this.model = this.modelService.setLock(true, this.model);
      }, function() {
        it('should reject move', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('Model is locked');
          });
        });
      });
    });
  });
});
