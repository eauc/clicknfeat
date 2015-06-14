'use strict';

describe('model counter', function() {
  describe('modelsMode service', function() {
    beforeEach(inject([
      'modelsMode',
      function(modelsModeService) {
        this.modelsModeService = modelsModeService;
        this.gameService = spyOnService('game');
        this.gameModelSelectionService = spyOnService('gameModelSelection');
      
        this.scope = { game: { model_selection: 'selection' },
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
        it('should toggle '+e.type+' display on local selection', function() {
          expect(this.gameModelSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onModels', 'toggleCounterDisplay', e.flag,
                                  'gameModelSelection.get.returnValue',
                                  this.scope, this.scope.game);
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
                                  'gameModelSelection.get.returnValue',
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
                                  'gameModelSelection.get.returnValue',
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
      describe('isCounterDisplayed(<counter>), '+dd, function() {
        using([
          [ 'dsp'                , 'isDisplayed' ],
          [ []                   , false ],
          [ ['a', 'r']           , false ],
          [ [ee.counter]         , true ],
          [ ['a',ee.counter,'r'] , true ],
        ], function(e, d) {
          it('should check whether model\'s counter is displayed, '+d, function() {
            expect(this.modelService.isCounterDisplayed(ee.counter, {
              state: { dsp: e.dsp }
            })).toBe(e.isDisplayed);
          });
        });
      });

      describe('toggleCounterDisplay(<counter>), '+dd, function() {
        using([
          [ 'dsp'                , 'new_dsp'     ],
          [ []                   , [ee.counter]  ],
          [ [ee.counter]         , []            ],
          [ ['a','r']            , ['a','r',ee.counter] ],
          [ ['a',ee.counter,'r'] , ['a','r']     ],
        ], function(e, d) {
          it('should toggle counter display for <model>, '+d, function() {
            this.model = {
              state: { dsp: e.dsp }
            };
            
            this.modelService.toggleCounterDisplay(ee.counter, this.model);

            expect(this.model.state.dsp).toEqual(e.new_dsp);
          });
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
