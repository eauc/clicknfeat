describe('model counter', function() {
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
      
        this.state = { game: { models: 'models',
                               model_selection: 'selection' },
                       factions: 'factions',
                       event: jasmine.createSpy('event')
                     };
      }
    ]));

    using([
      [ 'type' , 'flag' ], 
      [ 'Counter' , 'c' ],
      [ 'Souls'   , 's' ],
    ], function(e) {
      when('user toggles '+e.type+' display on models', function() {
        this.ret = this.modelsModeService
          .actions['toggle'+e.type+'Display'](this.state);
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
              this.thenExpect(this.ret, function() {
                expect(this.modelService.isCounterDisplayed)
                  .toHaveBeenCalledWith(e.flag, 'gameModels.findStamp.returnValue');
                expect(this.state.event)
                  .toHaveBeenCalledWith('Game.command.execute',
                                        'onModels', [ 'setCounterDisplay',
                                                      [e.flag, ee.set],
                                                      this.gameModelSelectionService.get._retVal
                                                    ]);
              });
            });
          });
        });
      });

      when('user increment '+e.type+' on models', function() {
        this.ret = this.modelsModeService
          .actions['increment'+e.type](this.state);
      }, function() {
        it('should increment counter on local selection', function() {
          expect(this.gameModelSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
          expect(this.state.event)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onModels', [ 'incrementCounter',
                                                [e.flag],
                                                this.gameModelSelectionService.get._retVal
                                              ]);
        });
      });

      when('user decrement '+e.type+' on models', function() {
        this.ret = this.modelsModeService
          .actions['decrement'+e.type](this.state);
      }, function() {
        it('should decrement '+e.type+' on local selection', function() {
          expect(this.gameModelSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
          expect(this.state.event)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onModels', [ 'decrementCounter',
                                                [e.flag],
                                                this.gameModelSelectionService.get._retVal
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
        
          this.model = this.modelService.toggleCounterDisplay(ee.counter, this.model);
          expect(this.modelService.isCounterDisplayed(ee.counter, this.model))
            .toBeTruthy();
        
          this.model = this.modelService.toggleCounterDisplay(ee.counter, this.model);
          expect(this.modelService.isCounterDisplayed(ee.counter, this.model))
            .toBeFalsy();
        });
      });
      
      describe('setCounterDisplay(<set>)', function() {
        it('should set counter display for <model>', function() {
          this.model = { state: { dsp: [] } };
        
          this.model = this.modelService.setCounterDisplay(ee.counter, true, this.model);
          expect(this.modelService.isCounterDisplayed(ee.counter, this.model))
            .toBeTruthy();
        
          this.model = this.modelService.setCounterDisplay(ee.counter, false, this.model);
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

          this.model = this.modelService
            .incrementCounter(ee.counter, this.model);

          expect(this.model.state[ee.counter]).toEqual(43);
        });
      });

      when('decrementCounter(<counter>), '+dd, function() {
        this.model = this.modelService
          .decrementCounter(ee.counter, this.model);
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
