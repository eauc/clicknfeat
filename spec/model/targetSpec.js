'use strict';

describe('model target', function() {
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

    when('user shift-click on model, ', function() {
      this.modelsModeService.actions.clickModel(this.scope, this.event, this.dom_event);
    }, function() {
      beforeEach(function() {
        this.event = { target: { state: { stamp: 'target' } } };
        this.dom_event = { shiftKey: true };
      });
        
      it('should orient model selection to target model', function() {
        expect(this.gameModelSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('onModels', 'orientTo', 'factions', this.event.target,
                                'gameModelSelection.get.returnValue',
                                this.scope, this.scope.game);
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
          base: 'small'
        };
      }
    ]));

    describe('orientTo(<factions>, <other>)', function() {
      it('should orient model to directly face <other>', function() {
        this.model = {
          state: { x: 240, y: 240, r: 0 }
        };
        this.other = {
          state: { x: 360, y: 360, r: 0 }
        };
          
        this.modelService.orientTo('factions', this.other, this.model);

        expect(this.model.state).toEqual({
          x: 240, y: 240, r: 135
        });
      });
    });
  });
});
