xdescribe('rulerMode model', function() {
  beforeEach(inject([ 'rulerMode', function(rulerMode) {
    this.rulerModeModel = rulerMode;

    this.appStateService = spyOnService('appState');
    this.modesModel = spyOnService('modes');
    this.gameRulerModel = spyOnService('gameRuler');
    this.modelModel = spyOnService('model');
    this.gameModelsModel = spyOnService('gameModels');
    this.gameModelSelectionModel = spyOnService('gameModelSelection');

    this.game = { ruler: 'ruler',
                  models: 'models',
                  model_selection: 'selection'
                };
    this.state = { modes: 'modes',
                   game: this.game
                 };
  }]));

  context('when user set ruler max length', function() {
    return this.rulerModeModel.actions
      .setMaxLength(this.state);
  }, function() {
    beforeEach(function() {
      this.gameRulerModel.origin
        .and.returnValue(null);
    });

    it('should prompt user for max length', function() {
      expect(this.promptService.promptP)
        .toHaveBeenCalledWith('prompt',
                              'Set ruler max length :',
                              'gameRuler.maxLength.returnValue');
    });

    example(function(e, d) {
      context('when user validates prompt, '+d, function() {
        this.promptService.promptP
          .resolveWith(e.value);
      }, function() {
        it('should set ruler max length', function() {
            expect(this.appStateService.chainReduce)
              .toHaveBeenCalledWith('Game.command.execute',
                                    'setRuler', [
                                      'setMaxLength',
                                      [e.max, this.state]
                                    ]);
        });

        context('ruler has origin model', function() {
          this.gameRulerModel.origin
            .and.returnValue('origin');
        }, function() {
          it('should set origin model\'s ruler max length', function() {
            expect(this.appStateService.chainReduce)
              .toHaveBeenCalledWith('Game.command.execute',
                                    'onModels', [
                                      'setRulerMaxLength',
                                      [e.max],
                                      ['origin']
                                    ]);
          });
        });
      });
    }, [
      [ 'value', 'max' ],
      [ 42     , 42    ],
      [ 0      , null  ],
    ]);

    context('when user cancel prompt', function() {
      this.promptService.promptP
        .rejectWith('canceled');
    }, function() {
      it('should reset ruler max length', function() {
        expect(this.appStateService.chainReduce)
          .toHaveBeenCalledWith('Game.command.execute',
                                'setRuler', [
                                  'setMaxLength',
                                  [null, this.state]
                                ]);
      });

      context('when ruler has origin model', function() {
        this.gameRulerModel.origin
          .and.returnValue('origin');
      }, function() {
        it('should reset origin model\'s ruler max length', function() {
          expect(this.appStateService.chainReduce)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onModels', [
                                    'setRulerMaxLength',
                                    [null],
                                    ['origin']
                                  ]);
        });
      });
    });
  });

  context('when user sets ruler origin', function() {
    return this.rulerModeModel.actions
      .setOriginModel(this.state, this.event);
  }, function() {
    beforeEach(function() {
      this.target = { state: { stamp: 'stamp' } };
      this.event = { 'click#': { target: this.target } };
    });

    it('should set ruler origin model', function() {
      expect(this.appStateService.chainReduce)
        .toHaveBeenCalledWith('Game.command.execute',
                              'setRuler', [
                                'setOrigin',
                                [this.target, this.state]
                              ]);
    });
  });

  context('when user sets ruler target', function() {
    return this.rulerModeModel.actions
      .setTargetModel(this.state, this.event);
  }, function() {
    beforeEach(function() {
      this.target = { state: { stamp: 'stamp' } };
      this.event = { 'click#': { target: this.target } };
    });

    it('should set ruler target model', function() {
      expect(this.appStateService.chainReduce)
        .toHaveBeenCalledWith('Game.command.execute',
                              'setRuler', [
                                'setTarget',
                                [this.target, this.state]
                              ]);
    });
  });

  context('when user creates aoe on ruler\'s target', function() {
    return this.rulerModeModel.actions
      .createAoEOnTarget(this.state);
  }, function() {
    beforeEach(function() {
      this.gameRulerModel.targetAoEPosition
        .and.returnValue({
          x: 42, y: 71, r: 45
        });
    });

    it('should get ruler target position', function() {
      expect(this.gameRulerModel.targetAoEPosition)
        .toHaveBeenCalledWith('models', 'ruler');
    });

    it('should execute createTemplate command', function() {
      expect(this.appStateService.chainReduce)
        .toHaveBeenCalledWith('Game.command.execute',
                              'createTemplate', [
                                { base: { x: 0, y: 0, r: 0 },
                                  templates: [ { x: 42, y: 71, r: 45,
                                                 type: 'aoe' } ]
                                },
                                false
                              ]);
    });
  });
});
