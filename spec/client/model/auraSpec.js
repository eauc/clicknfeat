'use strict';

xdescribe('model auras', function() {
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
      [ 'aura' , 'flag' ], 
      [ 'Red' , '#F00' ],
      [ 'Green' , '#0F0' ],
      [ 'Blue' , '#00F' ],
      [ 'Yellow' , '#FF0' ],
      [ 'Purple' , '#F0F' ],
      [ 'Cyan' , '#0FF' ],
    ], function(e, d) {
      when('user toggles '+e.aura+' aura display on models', function() {
        this.modelsModeService.actions['toggle'+e.aura+'AuraDisplay'](this.scope);
      }, function() {
        using([
          ['first' , 'set'],
          [ e.flag , null ],
          [ null   , e.flag ],
        ], function(ee, dd) {
          when('first selected model\'s auraDisplay is '+ee.first, function() {
            this.modelService.auraDisplay._retVal = ee.first;
          }, function() {
            it('should toggle '+e.aura+' aura display on local selection, '+dd, function() {
              expect(this.gameModelSelectionService.get)
                .toHaveBeenCalledWith('local', 'selection');
              expect(this.gameModelsService.findStamp)
                .toHaveBeenCalledWith('stamp1', 'models');
              expect(this.modelService.auraDisplay)
                .toHaveBeenCalledWith('gameModels.findStamp.returnValue');
              expect(this.gameService.executeCommand)
                .toHaveBeenCalledWith('onModels', 'setAuraDisplay', ee.set,
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

    describe('toggleAuraDisplay()', function() {
      it('should toggle aura display for <model>', function() {
        this.model = { state: { dsp: [] } };
        
        this.modelService.toggleAuraDisplay('aura', this.model);
        expect(this.modelService.auraDisplay(this.model))
          .toBe('aura');
        expect(this.modelService.isAuraDisplayed(this.model))
          .toBeTruthy();
        
        this.modelService.toggleAuraDisplay('aura', this.model);
        expect(this.modelService.auraDisplay(this.model))
          .toBe(null);
        expect(this.modelService.isAuraDisplayed(this.model))
          .toBeFalsy();
      });
    });

    describe('setAuraDisplay(<set>)', function() {
      it('should set aura display for <model>', function() {
        this.model = { state: { dsp: [] } };
        
        this.modelService.setAuraDisplay('aura', this.model);
        expect(this.modelService.auraDisplay(this.model))
          .toBe('aura');
        expect(this.modelService.isAuraDisplayed(this.model))
          .toBeTruthy();
        
        this.modelService.setAuraDisplay(null, this.model);
        expect(this.modelService.auraDisplay(this.model))
          .toBe(null);
        expect(this.modelService.isAuraDisplayed(this.model))
          .toBeFalsy();
      });
    });
  });
});
