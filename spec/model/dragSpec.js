'use strict';

describe('drag model', function() {
  describe('defaultMode service', function() {
    beforeEach(inject([
      'defaultMode',
      function(defaultModeService) {
        this.defaultModeService = defaultModeService;
        this.modesService = spyOnService('modes');
        this.gameModelSelectionService = spyOnService('gameModelSelection');

        this.scope = {
          game: { model_selection: 'selection' },
          modes: 'modes'
        };
        this.event = {
          target: { state: { stamp: 'stamp' } },
        };
      }
    ]));

    when('user starts dragging model', function() {
      this.defaultModeService.actions.dragStartModel(this.scope, this.event);
    }, function() {
      it('should set current selection', function() {
        expect(this.gameModelSelectionService.set)
          .toHaveBeenCalledWith('local', ['stamp'], this.scope, 'selection');
      });

      it('should forward dragStart action to new mode', function() {
        expect(this.modesService.currentModeAction)
          .toHaveBeenCalledWith('dragStartModel', this.scope, this.event, null,
                                'modes');
      });
    });
  });

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
      }
    ]));

    when('user starts dragging model', function() {
      this.modelModeService.actions.dragStartModel(this.scope, this.event);
    }, function() {
      beforeEach(function() {
        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 210, y: 201 },
        };

        this.gameModelSelectionService.get._retVal = ['stamp1','stamp2'];
        this.gameModelsService.findStamp.and.callFake(R.bind(function(s) {
          return R.find(R.pathEq(['state','stamp'], s), this.scope.game.models);
        }, this));
      });

      when('target model is not in current selection', function() {
        this.gameModelSelectionService.in._retVal = false;
      }, function() {
        it('should set current selection', function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('setModelSelection', 'set', ['stamp'],
                                  this.scope, this.scope.game);
        });
      });

      it('should get local model selection', function() {
        expect(this.gameModelSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameModelsService.findStamp)
          .toHaveBeenCalledWith('stamp1', this.scope.game.models);
        expect(this.gameModelsService.findStamp)
          .toHaveBeenCalledWith('stamp2', this.scope.game.models);
      });

      it('should update selection positions', function() {
        expect(this.modelService.setPosition)
          .toHaveBeenCalledWith('factions',
                                { x: 250, y: 241 },
                                this.scope.game.models[0]);
        expect(this.modelService.setPosition)
          .toHaveBeenCalledWith('factions',
                                { x: 210, y: 301 },
                                this.scope.game.models[1]);
      });

      it('should emit changeModel event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeModel-stamp1');
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeModel-stamp2');
      });
    });

    when('user drags model', function() {
      this.modelModeService.actions.dragModel(this.scope, this.event);
    }, function() {
      beforeEach(function() {
        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 210, y: 201 },
        };
        this.gameModelSelectionService.get._retVal = ['stamp1','stamp2'];
        this.gameModelsService.findStamp.and.callFake(R.bind(function(s) {
          return R.find(R.pathEq(['state','stamp'], s), this.scope.game.models);
        }, this));
        this.modelModeService.actions.dragStartModel(this.scope, this.event);

        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 230, y: 190 },
        };
      });

      it('should update target position', function() {
        expect(this.modelService.setPosition)
          .toHaveBeenCalledWith('factions',
                                { x: 270, y: 230 },
                                this.scope.game.models[0]);
        expect(this.modelService.setPosition)
          .toHaveBeenCalledWith('factions',
                                { x: 230, y: 290 },
                                this.scope.game.models[1]);
      });

      it('should emit changeModel event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeModel-stamp1');
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeModel-stamp2');
      });
    });

    when('user ends draging model', function() {
      this.modelModeService.actions.dragEndModel(this.scope, this.event);
    }, function() {
      beforeEach(function() {
        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 210, y: 201 },
        };
        this.gameModelSelectionService.get._retVal = ['stamp1','stamp2'];
        this.gameModelsService.findStamp.and.callFake(R.bind(function(s) {
          return R.find(R.pathEq(['state','stamp'], s), this.scope.game.models);
        }, this));
        this.modelModeService.actions.dragStartModel(this.scope, this.event);

        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 230, y: 190 },
        };
      });

      it('should restore dragStart model position', function() {
        expect(this.modelService.setPosition)
          .toHaveBeenCalledWith('factions',
                                { stamp: 'stamp1', x: 240, y: 240, r: 180 },
                                this.scope.game.models[0]);
        expect(this.modelService.setPosition)
          .toHaveBeenCalledWith('factions',
                                { stamp: 'stamp2', x: 200, y: 300, r:  90 },
                                this.scope.game.models[1]);
      });

      it('should execute onModels/shiftPosition command', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('onModels', 'shiftPosition', 'factions',
                                { x: 30, y: -10 }, ['stamp1','stamp2'],
                                this.scope, this.scope.game);
      });
    });
  });

  describe('model service', function() {
    beforeEach(inject([
      'model',
      function(modelService) {
        this.modelService = modelService;
        this.gameFactionsService = spyOnService('gameFactions');
        this.gameFactionsService.getModelInfo._retVal = {
          base_radius: 7.874
        };
      }
    ]));

    describe('setPosition(<pos>)', function() {
      beforeEach(function() {
        this.model = {
          state: { info: 'info', x: 240, y: 240, r: 180, dsp:[] }
        };
      });

      it('should set model position', function() {
        this.modelService.setPosition('factions', { x: 15, y: 42 }, this.model);
        expect(R.pick(['x','y','r'], this.model.state))
          .toEqual({ x: 15, y: 42, r: 180 });
      });

      it('should stay on board', function() {
        this.modelService.setPosition('factions', { x: -15, y: 494 }, this.model);
        expect(R.pick(['x','y','r'], this.model.state))
          .toEqual({ x: 7.874, y: 472.126, r: 180 });
      });

      when('model is locked', function() {
        this.modelService.setLock(true, this.model);
      }, function() {
        it('should not move model', function() {
          this.modelService.setPosition('factions', { x: -15, y: 494 }, this.model);
          expect(R.pick(['x','y','r'], this.model.state))
            .toEqual({ x: 240, y: 240, r: 180 });
        });
      });
    });

    describe('shiftPosition(<pos>)', function() {
      beforeEach(function() {
        this.model = {
          state: { info: 'info', x: 440, y: 440, r: 180, dsp:[] }
        };
      });

      it('should set model position', function() {
        this.modelService.shiftPosition('factions', { x: 15, y: 20 }, this.model);
        expect(R.pick(['x','y','r'], this.model.state))
          .toEqual({ x: 455, y: 460, r: 180 });
      });

      it('should stay on board', function() {
        this.modelService.shiftPosition('factions', { x: 40, y: 50 }, this.model);
        expect(R.pick(['x','y','r'], this.model.state))
          .toEqual({ x: 472.126, y: 472.126, r: 180 });
      });

      when('model is locked', function() {
        this.modelService.setLock(true, this.model);
      }, function() {
        it('should not move model', function() {
          this.modelService.shiftPosition('factions', { x: 40, y: 50 }, this.model);
          expect(R.pick(['x','y','r'], this.model.state))
            .toEqual({ x: 440, y: 440, r: 180 });
        });
      });
    });
  });
});
