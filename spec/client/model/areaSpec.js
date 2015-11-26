'use strict';

describe('model areas', function() {
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

    when('user toggles ctrl area display on models', function() {
      this.modelsModeService.actions['toggleCtrlAreaDisplay'](this.scope);
    }, function() {
      using([
        ['first', 'set' ],
        [ true  , false ],
        [ false , true  ],
      ], function(ee, dd) {
        when('first selected model\'s ctrlAreaDisplay is '+ee.first, function() {
          this.modelService.isCtrlAreaDisplayed._retVal = ee.first;
        }, function() {
          it('should toggle ctrlArea display on local selection, '+dd, function() {
            expect(this.gameModelSelectionService.get)
              .toHaveBeenCalledWith('local', 'selection');
            expect(this.gameModelsService.findStamp)
              .toHaveBeenCalledWith('stamp1', 'models');
            expect(this.modelService.isCtrlAreaDisplayed)
              .toHaveBeenCalledWith('factions', 'gameModels.findStamp.returnValue');
            expect(this.gameService.executeCommand)
              .toHaveBeenCalledWith('onModels', 'setCtrlAreaDisplay', ee.set,
                                    this.gameModelSelectionService.get._retVal,
                                    this.scope, this.scope.game);
          });
        });
      });
    });

    using([
      [ 'area' ], 
      [ 1 ],[ 2 ],[ 3 ],[ 4 ],[ 5 ],[ 6 ],[ 7 ],[ 8 ],[ 9 ],[ 10 ],
      [ 11 ],[ 12 ],[ 13 ],[ 14 ],[ 15 ],[ 16 ],[ 17 ],[ 18 ],[ 19 ],[ 20 ],
    ], function(e, d) {
      when('user toggles '+e.area+'" area display on models', function() {
        this.modelsModeService.actions['toggle'+e.area+'InchesAreaDisplay'](this.scope);
      }, function() {
        using([
          ['first' , 'set'],
          [ e.area , null ],
          [ null   , e.area ],
        ], function(ee, dd) {
          when('first selected model\'s areaDisplay is '+ee.first, function() {
            this.modelService.areaDisplay._retVal = ee.first;
          }, function() {
            it('should toggle '+e.area+' area display on local selection, '+dd, function() {
              expect(this.gameModelSelectionService.get)
                .toHaveBeenCalledWith('local', 'selection');
              expect(this.gameModelsService.findStamp)
                .toHaveBeenCalledWith('stamp1', 'models');
              expect(this.modelService.areaDisplay)
                .toHaveBeenCalledWith('gameModels.findStamp.returnValue');
              expect(this.gameService.executeCommand)
                .toHaveBeenCalledWith('onModels', 'setAreaDisplay', ee.set,
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
        this.gameFactionsService.getModelInfo._retVal = {
          type: 'wardude',
          focus: 8
        };
      }
    ]));

    describe('toggleCtrlAreaDisplay()', function() {
      it('should toggle ctrlArea display for <model>', function() {
        this.model = { state: { dsp: [] } };
        
        this.modelService.toggleCtrlAreaDisplay(this.model);
        expect(this.modelService.isCtrlAreaDisplayed('factions', this.model))
          .toBeTruthy();
        
        this.modelService.toggleCtrlAreaDisplay(this.model);
        expect(this.modelService.isCtrlAreaDisplayed('factions', this.model))
          .toBeFalsy();
      });
    });

    describe('setCtrlAreaDisplay(<set>)', function() {
      it('should set ctrlArea display for <model>', function() {
        this.model = { state: { dsp: [] } };
        
        this.modelService.setCtrlAreaDisplay(true, this.model);
        expect(this.modelService.isCtrlAreaDisplayed('factions', this.model))
          .toBeTruthy();
        
        this.modelService.setCtrlAreaDisplay(false, this.model);
        expect(this.modelService.isCtrlAreaDisplayed('factions', this.model))
          .toBeFalsy();
      });
    });

    describe('toggleAreaDisplay()', function() {
      it('should toggle area display for <model>', function() {
        this.model = { state: { dsp: [] } };
        
        this.modelService.toggleAreaDisplay('area', this.model);
        expect(this.modelService.areaDisplay(this.model))
          .toBe('area');
        expect(this.modelService.isAreaDisplayed(this.model))
          .toBeTruthy();
        
        this.modelService.toggleAreaDisplay('area', this.model);
        expect(this.modelService.areaDisplay(this.model))
          .toBe(null);
        expect(this.modelService.isAreaDisplayed(this.model))
          .toBeFalsy();
      });
    });

    describe('setAreaDisplay(<set>)', function() {
      it('should set area display for <model>', function() {
        this.model = { state: { dsp: [] } };
        
        this.modelService.setAreaDisplay('area', this.model);
        expect(this.modelService.areaDisplay(this.model))
          .toBe('area');
        expect(this.modelService.isAreaDisplayed(this.model))
          .toBeTruthy();
        
        this.modelService.setAreaDisplay(null, this.model);
        expect(this.modelService.areaDisplay(this.model))
          .toBe(null);
        expect(this.modelService.isAreaDisplayed(this.model))
          .toBeFalsy();
      });
    });
  });
});