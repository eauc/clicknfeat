'use strict';

describe('model melee', function() {
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
      [ 'melee' , 'flag' ],
      [ 'Melee' , 'mm' ],
      [ 'Reach' , 'mr' ],
      [ 'Strike', 'ms' ],
    ], function(e, d) {
      when('user toggles melee display on models, '+d, function() {
        this.modelsModeService.actions['toggle'+e.melee+'Display'](this.scope);
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
              expect(this.modelService.isMeleeDisplayed)
                .toHaveBeenCalledWith(e.flag, 'gameModels.findStamp.returnValue');
              expect(this.gameService.executeCommand)
                .toHaveBeenCalledWith('onModels', 'setMeleeDisplay', e.flag, ee.set,
                                      this.gameModelSelectionService.get._retVal,
                                      this.scope, this.scope.game);
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
        
        this.modelService.toggleMeleeDisplay('melee', this.model);
        expect(this.modelService.isMeleeDisplayed('melee', this.model))
          .toBeTruthy();
        
        this.modelService.toggleMeleeDisplay('melee', this.model);
        expect(this.modelService.isMeleeDisplayed('melee', this.model))
          .toBeFalsy();
      });
    });

    describe('setMeleeDisplay(<set>)', function() {
      it('should set melee display for <model>', function() {
        this.model = { state: { dsp: [] } };
        
        this.modelService.setMeleeDisplay('melee', true, this.model);
        expect(this.modelService.isMeleeDisplayed('melee', this.model))
          .toBeTruthy();
        
        this.modelService.setMeleeDisplay('melee', false, this.model);
        expect(this.modelService.isMeleeDisplayed('melee', this.model))
          .toBeFalsy();
      });
    });
  });
});
