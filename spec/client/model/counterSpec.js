'use strict';

describe('model counter', function() {
  describe('modelsMode service', function() {
    beforeEach(inject([
      'modelsMode',
      function(modelsModeService) {
        this.modelsModeService = modelsModeService;
        this.gameService = spyOnService('game');
        this.gameModelsService = spyOnService('gameModels');
        this.gameModelSelectionService = spyOnService('gameModelSelection');
        this.gameModelSelectionService.get._retVal = ['stamp1','stamp2'];
        this.modelService = spyOnService('model');
      
        this.scope = { game: { models: 'models',
                               model_selection: 'selection' },
                       factions: 'factions'
                     };
      }
    ]));

    using([
      [ 'type' , 'flag' ], 
      [ 'Counter' , 'c' ],
      [ 'Souls'   , 's' ],
    ], function(e, d) {
      when('user toggles '+e.type+' display on models', function() {
        this.modelsModeService.actions['toggle'+e.type+'Display'](this.scope);
      }, function() {
        using([
          ['first', 'set'],
          [ true  , false],
          [ false , true ],
        ], function(ee, dd) {
          when('first selected model\'s counterDisplayed is '+ee.first, function() {
            this.modelService.isCounterDisplayed._retVal = ee.first;
          }, function() {
            it('should toggle wreck display on local selection, '+dd, function() {
              expect(this.gameModelSelectionService.get)
                .toHaveBeenCalledWith('local', 'selection');
              expect(this.gameModelsService.findStamp)
                .toHaveBeenCalledWith('stamp1', 'models');
              expect(this.modelService.isCounterDisplayed)
                .toHaveBeenCalledWith(e.flag, 'gameModels.findStamp.returnValue');
              expect(this.gameService.executeCommand)
                .toHaveBeenCalledWith('onModels', 'setCounterDisplay', e.flag, ee.set,
                                      this.gameModelSelectionService.get._retVal,
                                      this.scope, this.scope.game);
            });
          });
        });
      });

      when('user increment '+e.type+' on models', function() {
        this.modelsModeService.actions['increment'+e.type](this.scope);
      }, function() {
        it('should increment counter on local selection', function() {
          expect(this.gameModelSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onModels', 'incrementCounter', e.flag,
                                  this.gameModelSelectionService.get._retVal,
                                  this.scope, this.scope.game);
        });
      });

      when('user decrement '+e.type+' on models', function() {
        this.modelsModeService.actions['decrement'+e.type](this.scope);
      }, function() {
        it('should decrement '+e.type+' on local selection', function() {
          expect(this.gameModelSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onModels', 'decrementCounter', e.flag,
                                  this.gameModelSelectionService.get._retVal,
                                  this.scope, this.scope.game);
        });
      });
    });
  });

  describe('model service', function() {
    beforeEach(inject([
      'model',
      function(modelService) {
        this.modelService = modelService;
        this.gameFactionsService = spyOnService('gameFactions');
      }
    ]));

    using([
      [ 'counter' ],
      [ 'c'       ],
      [ 's'       ],
    ], function(ee, dd) {
      describe('toggleCounterDisplay(<counter>)', function() {
        it('should toggle wreck display for <model>', function() {
          this.model = { state: { dsp: [] } };
        
          this.modelService.toggleCounterDisplay(ee.counter, this.model);
          expect(this.modelService.isCounterDisplayed(ee.counter, this.model))
            .toBeTruthy();
        
          this.modelService.toggleCounterDisplay(ee.counter, this.model);
          expect(this.modelService.isCounterDisplayed(ee.counter, this.model))
            .toBeFalsy();
        });
      });
      
      describe('setCounterDisplay(<set>)', function() {
        it('should set counter display for <model>', function() {
          this.model = { state: { dsp: [] } };
        
          this.modelService.setCounterDisplay(ee.counter, true, this.model);
          expect(this.modelService.isCounterDisplayed(ee.counter, this.model))
            .toBeTruthy();
        
          this.modelService.setCounterDisplay(ee.counter, false, this.model);
          expect(this.modelService.isCounterDisplayed(ee.counter, this.model))
            .toBeFalsy();
        });
      });

      describe('incrementCounter(<counter>), '+dd, function() {
        it('should increment <counter>', function() {
          this.model = {
            state: { }
          };
          this.model.state[ee.counter] = 42;

          this.modelService.incrementCounter(ee.counter, this.model);

          expect(this.model.state[ee.counter]).toEqual(43);
        });
      });

      when('decrementCounter(<counter>), '+dd, function() {
        this.modelService.decrementCounter(ee.counter, this.model);
      }, function() {
        beforeEach(function() {
          this.model = {
            state: {}
          };
          this.model.state[ee.counter] = 42;
        });
        
        it('should decrement <counter>', function() {
          expect(this.model.state[ee.counter]).toEqual(41);
        });
        
        when('<counter> is 0', function() {
          this.model.state[ee.counter] = 0;
        }, function() {
          it('should not decrement <counter>', function() {
            expect(this.model.state[ee.counter]).toEqual(0);
          });
        });
      });
    });
  });
});
