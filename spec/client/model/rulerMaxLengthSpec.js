'use strict';

describe('model ruler', function() {
  describe('modelsMode service', function() {
    beforeEach(inject([
      'modelsMode',
      function(modelsModeService) {
        this.modelsModeService = modelsModeService;
        this.gameService = spyOnService('game');
        this.modelService = spyOnService('model');
        this.gameModelsService = spyOnService('gameModels');
        this.gameModelSelectionService = spyOnService('gameModelSelection');
      
        this.scope = { game: { model_selection: 'selection',
                               models: 'models'
                             },
                       factions: 'factions'
                     };
      }
    ]));

    describe('when user set ruler max length', function() {
      beforeEach(function() {
        this.gameModelSelectionService.get._retVal = ['stamp1','stamp2'];
        this.modelService.rulerMaxLength._retVal = 42;

        this.modelsModeService.actions.setRulerMaxLength(this.scope);
      });

      it('should fetch first model\'s ruler max length', function() {
        expect(this.gameModelSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameModelsService.findStamp)
          .toHaveBeenCalledWith('stamp1', 'models');
        expect(this.modelService.rulerMaxLength)
          .toHaveBeenCalledWith('gameModels.findStamp.returnValue');
      });
      
      it('should prompt user for max length', function() {
        expect(this.promptService.prompt)
          .toHaveBeenCalledWith('prompt',
                                'Set ruler max length :',
                                42);
      });

      using([
        [ 'value', 'max' ],
        [ 42     , 42    ],
        [ 0      , null  ],
      ], function(e, d) {
        describe('when user validates prompt, '+d, function() {
          beforeEach(function() {
            this.promptService.prompt.resolve(e.value);
          });
          
          it('should set model\'s ruler max length', function() {
            expect(this.gameService.executeCommand)
              .toHaveBeenCalledWith('onModels', 'setRulerMaxLength', e.max,
                                    ['stamp1','stamp2'], this.scope, this.scope.game);
          });
        });
      });

      describe('when user cancel prompt', function() {
        beforeEach(function() {
          this.promptService.prompt.reject('canceled');
        });
        
        it('should reset model\'s ruler max length', function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onModels', 'setRulerMaxLength', null,
                                  ['stamp1','stamp2'], this.scope, this.scope.game);
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
        
        this.modelService.setRulerMaxLength(42, this.model);

        expect(this.modelService.rulerMaxLength(this.model))
          .toBe(42);
      });
    });
  });
});
