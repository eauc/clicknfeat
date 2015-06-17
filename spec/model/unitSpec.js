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

  describe('modelMode service', function() {
    beforeEach(inject([
      'modelMode',
      function(modelModeService) {
        this.modelModeService = modelModeService;
        this.gameService = spyOnService('game');
        this.gameModelsService = spyOnService('gameModels');
        this.gameModelSelectionService = spyOnService('gameModelSelection');
      
        this.scope = { game: { model_selection: 'selection',
                               models: 'models'
                             },
                       factions: 'factions'
                     };
      }
    ]));

    describe('when user select all unit', function() {
      beforeEach(function() {
        this.gameModelSelectionService.get._retVal = ['stamp1'];
        this.gameModelsService.findStamp._retVal = {
          state: { user: 'user', u: 42 }
        };
        this.scope.game.models = {
          active: [
            { state: { stamp: 'a1', user: 'user', u: 42 } },
            { state: { stamp: 'a2', user: 'other', u: 42 } },
            { state: { stamp: 'a3', user: 'user', u: 0 } },
            { state: { stamp: 'a4', user: 'other', u: 0 } },
          ],
          locked: [
            { state: { stamp: 'l1', user: 'user', u: 42 } },
            { state: { stamp: 'l2', user: 'other', u: 42 } },
            { state: { stamp: 'l3', user: 'user', u: 0 } },
            { state: { stamp: 'l4', user: 'other', u: 0 } },
          ]
        };
        this.gameModelsService.all.and.callThrough();
        
        this.modelModeService.actions.selectAllUnit(this.scope);
      });

      it('should fetch selected model', function() {
        expect(this.gameModelSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameModelsService.findStamp)
          .toHaveBeenCalledWith('stamp1', this.scope.game.models);
      });
      
      it('should select all models with the same user & unit number', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('setModelSelection', 'set', ['a1', 'l1'],
                                this.scope, this.scope.game);
      });
    });
  });

  describe('gameModels service', function() {
    beforeEach(inject([
      'gameModels',
      function(gameModelsService) {
        this.gameModelsService = gameModelsService;
      }
    ]));

    describe('all', function() {
      it('should return a list of all models', function() {
        expect(this.gameModelsService.all({
          active: [ 'active' ],
          locked: [ 'locked' ],
        })).toEqual([ 'active', 'locked' ]);
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

    describe('stamp', function() {
      it('should return model\'s stamp', function() {
        expect(this.modelService.stamp({
          state: { stamp: 'stamp' }
        })).toBe('stamp');
      });
    });

    describe('user', function() {
      it('should return model\'s user', function() {
        expect(this.modelService.user({
          state: { user: 'toto' }
        })).toBe('toto');
      });
    });

    describe('userIs(<user>)', function() {
      using([
        ['user', 'is' ],
        ['toto', true ],
        ['tata', false],
      ], function(e,d) {
        it('should check whether model\s user is <user>, '+d, function() {
          expect(this.modelService.userIs(e.user, {
            state: { user: 'toto' }
          })).toBe(e.is);
        });
      });
    });

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

    describe('unitIs(<unit>)', function() {
      using([
        ['unit', 'is' ],
        [ 42   , true ],
        [ 71   , false],
      ], function(e,d) {
        it('should check whether model\s unit number is <unit>, '+d, function() {
          expect(this.modelService.unitIs(e.unit, {
            state: { u: 42 }
          })).toBe(e.is);
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
