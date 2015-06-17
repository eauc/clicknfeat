'use strict';

describe('model unit', function() {
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

    when('user toggles unit display on models', function() {
      this.modelsModeService.actions
        .toggleUnitDisplay(this.scope);
    }, function() {
      it('should toggle unit display on local selection', function() {
        expect(this.gameModelSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('onModels', 'toggleUnitDisplay',
                                'gameModelSelection.get.returnValue',
                                this.scope, this.scope.game);
      });
    });

    describe('when user set unit number', function() {
      beforeEach(function() {
        this.gameModelSelectionService.get._retVal = ['stamp1','stamp2'];
        this.modelService.unit._retVal = 42;

        this.modelsModeService.actions.setUnit(this.scope);
      });

      it('should fetch first model\'s unit number', function() {
        expect(this.gameModelSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameModelsService.findStamp)
          .toHaveBeenCalledWith('stamp1', 'models');
        expect(this.modelService.unit)
          .toHaveBeenCalledWith('gameModels.findStamp.returnValue');
      });
      
      it('should prompt user for unit number', function() {
        expect(this.promptService.prompt)
          .toHaveBeenCalledWith('prompt',
                                'Set unit number :',
                                42);
      });

      using([
        [ 'value', 'unit' ],
        [ 42     , 42    ],
        [ 0      , 0  ],
      ], function(e, d) {
        describe('when user validates prompt, '+d, function() {
          beforeEach(function() {
            this.promptService.prompt.resolve(e.value);
          });
          
          it('should set model\'s unit number', function() {
            expect(this.gameService.executeCommand)
              .toHaveBeenCalledWith('onModels', 'setUnit', e.unit,
                                    ['stamp1','stamp2'], this.scope, this.scope.game);
          });
        });
      });

      describe('when user cancel prompt', function() {
        beforeEach(function() {
          this.promptService.prompt.reject('canceled');
        });
        
        it('should reset model\'s unit', function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onModels', 'setUnit', null,
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

    describe('isUnitDisplayed', function() {
      using([
        [ 'dsp'         , 'isDisplayed' ],
        [ []            , false ],
        [ ['a', 'r']    , false ],
        [ ['u']         , true ],
        [ ['a','u','r'] , true ],
      ], function(e, d) {
        it('should check whether model\'s unit number is displayed, '+d, function() {
          expect(this.modelService.isUnitDisplayed({
            state: { dsp: e.dsp }
          })).toBe(e.isDisplayed);
        });
      });
    });

    describe('setUnit(<unit>)', function() {
      it('should set model\'s unit number', function() {
        this.model = {
          state: { stamp: 'stamp' }
        };
        
        this.modelService.setUnit(42, this.model);
        
        expect(this.modelService.unit(this.model))
          .toBe(42);
      });
    });

    describe('toggleUnitDisplay()', function() {
      using([
        [ 'dsp'         , 'new_dsp'     ],
        [ []            , ['u']         ],
        [ ['u']         , []            ],
        [ ['a','r']     , ['a','r','u'] ],
        [ ['a','u','r'] , ['a','r']     ],
      ], function(e, d) {
        it('should toggle unit number display for <model>, '+d, function() {
          this.model = {
            state: { dsp: e.dsp }
          };
          
          this.modelService.toggleUnitDisplay(this.model);

          expect(this.model.state.dsp).toEqual(e.new_dsp);
        });
      });
    });
  });
});
