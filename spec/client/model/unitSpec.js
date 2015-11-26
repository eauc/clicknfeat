'use strict';

describe('model unit', function() {
  describe('modelsMode service', function() {
    beforeEach(inject([
      'modelsMode',
      function(modelsModeService) {
        this.modelsModeService = modelsModeService;

        this.gameService = spyOnService('game');

        this.gameModelsService = spyOnService('gameModels');
        mockReturnPromise(this.gameModelsService.findStamp);
        this.gameModelsService.findStamp.resolveWith = 'gameModels.findStamp.returnValue';
        
        this.gameModelSelectionService = spyOnService('gameModelSelection');
        this.gameModelSelectionService.get._retVal = ['stamp1','stamp2'];

        this.modelService = spyOnService('model');
      
        this.scope = { game: { models: 'models',
                               model_selection: 'selection' },
                       factions: 'factions'
                     };
      }
    ]));

    when('user toggles unit display on models', function() {
      this.ret = this.modelsModeService.actions
        .toggleUnitDisplay(this.scope);
    }, function() {
      using([
        ['first', 'set'],
        [ true  , false],
        [ false , true ],
      ], function(e, d) {
        when('first selected model\'s unitDisplayed is '+e.first, function() {
          this.modelService.isUnitDisplayed._retVal = e.first;
        }, function() {
          it('should toggle unit display on local selection, '+d, function() {
            expect(this.gameModelSelectionService.get)
              .toHaveBeenCalledWith('local', 'selection');
            expect(this.gameModelsService.findStamp)
              .toHaveBeenCalledWith('stamp1', 'models');
            this.thenExpect(this.ret, function(result) {
              expect(this.modelService.isUnitDisplayed)
                .toHaveBeenCalledWith('gameModels.findStamp.returnValue');
              expect(this.gameService.executeCommand)
                .toHaveBeenCalledWith('onModels', 'setUnitDisplay', e.set,
                                      this.gameModelSelectionService.get._retVal,
                                      this.scope, this.scope.game);
              expect(result).toBe('game.executeCommand.returnValue');
            });
          });
        });
      });
    });
    
    when('user set unit number', function() {
      this.ret = this.modelsModeService.actions.setUnit(this.scope);
    }, function() {
      beforeEach(function() {
        this.gameModelSelectionService.get._retVal = ['stamp1','stamp2'];
        this.modelService.unit._retVal = 42;

        this.promptService.prompt.resolveWith = 71;
      });

      it('should fetch first model\'s unit number', function() {
        expect(this.gameModelSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameModelsService.findStamp)
          .toHaveBeenCalledWith('stamp1', 'models');
        this.thenExpect(this.ret, function() {
          expect(this.modelService.unit)
            .toHaveBeenCalledWith('gameModels.findStamp.returnValue');
        });
      });
      
      it('should prompt user for unit number', function() {
        this.thenExpect(this.ret, function() {
          expect(this.promptService.prompt)
            .toHaveBeenCalledWith('prompt',
                                  'Set unit number :',
                                  42);
        });
      });

      using([
        [ 'value', 'unit' ],
        [ 42     , 42    ],
        [ 0      , 0  ],
      ], function(e, d) {
        when('user validates prompt, '+d, function() {
          this.promptService.prompt.resolveWith = e.value;
        }, function() {
          it('should set model\'s unit number', function() {
            this.thenExpect(this.ret, function(result) {
              expect(this.gameService.executeCommand)
                .toHaveBeenCalledWith('onModels', 'setUnit', e.unit,
                                      ['stamp1','stamp2'], this.scope, this.scope.game);
              expect(result).toBe('game.executeCommand.returnValue');
            });
          });
        });
      });

      when('user cancel prompt', function() {
        this.promptService.prompt.rejectWith = 'canceled';
      }, function() {
        it('should reset model\'s unit', function() {
          this.thenExpect(this.ret, function(result) {
            expect(this.gameService.executeCommand)
              .toHaveBeenCalledWith('onModels', 'setUnit', null,
                                    ['stamp1','stamp2'], this.scope, this.scope.game);
            expect(result).toBe('game.executeCommand.returnValue');
          });
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
        mockReturnPromise(this.gameModelsService.findStamp);
        this.gameModelSelectionService = spyOnService('gameModelSelection');
      
        this.scope = { game: { model_selection: 'selection',
                               models: 'models'
                             },
                       factions: 'factions'
                     };
      }
    ]));

    when('user select all unit', function() {
      this.ret = this.modelModeService.actions.selectAllUnit(this.scope);
    }, function() {
      beforeEach(function() {
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
        this.gameModelSelectionService.get._retVal = ['stamp1'];
        this.gameModelsService.findStamp.resolveWith = {
          state: { user: 'user', u: 42 }
        };
      });

      it('should fetch selected model', function() {
        expect(this.gameModelSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameModelsService.findStamp)
          .toHaveBeenCalledWith('stamp1', this.scope.game.models);
      });
      
      it('should select all models with the same user & unit number', function() {
        this.thenExpect(this.ret, function(result) {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('setModelSelection', 'set', ['a1', 'l1'],
                                  this.scope, this.scope.game);
          expect(result).toBe('game.executeCommand.returnValue');
        });
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
      it('should toggle unit display for <model>', function() {
        this.model = { state: { dsp: [] } };
        
        this.modelService.toggleUnitDisplay(this.model);
        expect(this.modelService.isUnitDisplayed(this.model))
          .toBeTruthy();
        
        this.modelService.toggleUnitDisplay(this.model);
        expect(this.modelService.isUnitDisplayed(this.model))
          .toBeFalsy();
      });
    });

    describe('setUnitDisplay(<set>)', function() {
      it('should set unit display for <model>', function() {
        this.model = { state: { dsp: [] } };
        
        this.modelService.setUnitDisplay(true, this.model);
        expect(this.modelService.isUnitDisplayed(this.model))
          .toBeTruthy();
        
        this.modelService.setUnitDisplay(false, this.model);
        expect(this.modelService.isUnitDisplayed(this.model))
          .toBeFalsy();
      });
    });
  });
});
