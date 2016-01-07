describe('model melee', function() {
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
      [ 'melee' , 'flag' ],
      [ 'Melee' , 'mm' ],
      [ 'Reach' , 'mr' ],
      [ 'Strike', 'ms' ],
    ], function(e, d) {
      when('user toggles melee display on models, '+d, function() {
        this.ret = this.modelsModeService
          .actions['toggle'+e.melee+'Display'](this.state);
      }, function() {
        using([
          ['first', 'set'],
          [ true  , false],
          [ false , true ],
        ], function(ee, dd) {
          when('first selected model\'s meleeDisplay is '+ee.first, function() {
            this.modelService.isMeleeDisplayed._retVal = ee.first;
          }, function() {
            it('should toggle '+e.melee+' melee display on local selection, '+dd, function() {
              expect(this.gameModelSelectionService.get)
                .toHaveBeenCalledWith('local', 'selection');
              expect(this.gameModelsService.findStamp)
                .toHaveBeenCalledWith('stamp1', 'models');
              this.thenExpect(this.ret, function(result) {
                expect(this.modelService.isMeleeDisplayed)
                  .toHaveBeenCalledWith(e.flag, 'gameModels.findStamp.returnValue');
                expect(this.state.event)
                  .toHaveBeenCalledWith('Game.command.execute',
                                        'onModels', [ 'setMeleeDisplay', [e.flag, ee.set],
                                                      this.gameModelSelectionService.get._retVal
                                                    ]);
              });
            });
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
        this.gameFactionsService = spyOnService('gameFactions');
      }
    ]));

    describe('toggleMeleeDisplay()', function() {
      it('should toggle melee display for <model>', function() {
        this.model = { state: { dsp: [] } };
        
        this.model = this.modelService.toggleMeleeDisplay('melee', this.model);
        expect(this.modelService.isMeleeDisplayed('melee', this.model))
          .toBeTruthy();
        
        this.model = this.modelService.toggleMeleeDisplay('melee', this.model);
        expect(this.modelService.isMeleeDisplayed('melee', this.model))
          .toBeFalsy();
      });
    });

    describe('setMeleeDisplay(<set>)', function() {
      it('should set melee display for <model>', function() {
        this.model = { state: { dsp: [] } };
        
        this.model = this.modelService.setMeleeDisplay('melee', true, this.model);
        expect(this.modelService.isMeleeDisplayed('melee', this.model))
          .toBeTruthy();
        
        this.model = this.modelService.setMeleeDisplay('melee', false, this.model);
        expect(this.modelService.isMeleeDisplayed('melee', this.model))
          .toBeFalsy();
      });
    });
  });
});
