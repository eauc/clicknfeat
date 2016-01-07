describe('model ruler', function() {
  describe('modelsMode service', function() {
    beforeEach(inject([
      'modelsMode',
      function(modelsModeService) {
        this.modelsModeService = modelsModeService;

        this.modelService = spyOnService('model');

        this.gameModelsService = spyOnService('gameModels');
        mockReturnPromise(this.gameModelsService.findStamp);
        this.gameModelsService.findStamp.resolveWith = 'gameModels.findStamp.returnValue';
        
        this.gameModelSelectionService = spyOnService('gameModelSelection');
      
        this.state = { game: { model_selection: 'selection',
                               models: 'models'
                             },
                       factions: 'factions',
                       event: jasmine.createSpy('event')
                     };
      }
    ]));

    when('user sets ruler max length', function() {
      this.ret = this.modelsModeService.actions
        .setRulerMaxLength(this.state);
    }, function() {
      beforeEach(function() {
        this.gameModelSelectionService.get._retVal = ['stamp1','stamp2'];
        this.modelService.rulerMaxLength._retVal = 42;
        this.promptService.prompt.resolveWith = 71;
      });

      it('should fetch first model\'s ruler max length', function() {
        expect(this.gameModelSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameModelsService.findStamp)
          .toHaveBeenCalledWith('stamp1', 'models');
        this.thenExpect(this.ret, function() {
          expect(this.modelService.rulerMaxLength)
            .toHaveBeenCalledWith('gameModels.findStamp.returnValue');
        });
      });
      
      it('should prompt user for max length', function() {
        this.thenExpect(this.ret, function() {
          expect(this.promptService.prompt)
            .toHaveBeenCalledWith('prompt',
                                  'Set ruler max length :',
                                  42);
        });
      });

      using([
        [ 'value', 'max' ],
        [ 42     , 42    ],
        [ 0      , null  ],
      ], function(e, d) {
        when('user validates prompt, '+d, function() {
          this.promptService.prompt.resolveWith = e.value;
        }, function() {
          it('should set model\'s ruler max length', function() {
            this.thenExpect(this.ret, function() {
              expect(this.state.event)
                .toHaveBeenCalledWith('Game.command.execute',
                                      'onModels', [ 'setRulerMaxLength', [e.max],
                                                    ['stamp1','stamp2']
                                                  ]);
            });
          });
        });
      });

      when('user cancels prompt', function() {
        this.promptService.prompt.rejectWith = 'canceled';
      }, function() {
        it('should set model\'s ruler max length', function() {
          this.thenExpect(this.ret, function() {
            expect(this.state.event)
              .toHaveBeenCalledWith('Game.command.execute',
                                    'onModels', [ 'setRulerMaxLength', [null],
                                                  ['stamp1','stamp2']
                                                ]);
          });
        });
      });
    });
  });

  describe('model service', function() {
    beforeEach(inject([
      'model',
      function(modelService) {
        this.modelService = modelService;
      }
    ]));

    describe('setRulerMaxLength(<length>)', function() {
      it('should set model\'s ruler max length', function() {
        this.model = { state: {} };
        
        this.model = this.modelService
          .setRulerMaxLength(42, this.model);

        expect(this.modelService.rulerMaxLength(this.model))
          .toBe(42);
      });
    });
  });
});
