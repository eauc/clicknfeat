'use strict';

xdescribe('model create template', function() {
  describe('modelMode service', function() {
    beforeEach(inject([
      'modelMode',
      function(modelModeService) {
        this.modelModeService = modelModeService;
        this.gameService = spyOnService('game');
        this.gameModelsService = spyOnService('gameModels');
        this.gameModelSelectionService = spyOnService('gameModelSelection');
        this.sprayTemplateModeService = spyOnService('sprayTemplateMode');
        spyOn(this.sprayTemplateModeService.actions, 'clickModel');
      
        this.scope = { game: { model_selection: 'selection',
                               models: 'models'
                             },
                       factions: 'factions'
                     };
      }
    ]));

    when('user create AoE on model', function() {
      this.modelModeService.actions
        .createAoEOnModel(this.scope);
    }, function() {
      beforeEach(function() {
        this.gameModelSelectionService.get._retVal = ['stamp'];
        this.gameModelsService.findStamp._retVal = {
          state: { x: 42, y: 71 }
        };
      });
      
      it('should create AoE centered on model', function() {
        expect(this.gameModelSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameModelsService.findStamp)
          .toHaveBeenCalledWith('stamp', 'models');
        
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('createTemplate', { x: 42, y: 71, type: 'aoe' },
                                this.scope, this.scope.game);
      });
    });

    when('user create spray on model', function() {
      this.modelModeService.actions
        .createSprayOnModel(this.scope);
    }, function() {
      beforeEach(function() {
        this.model = {
          state: { stamp: 'stamp', x: 42, y: 71 }
        };
        this.gameModelSelectionService.get._retVal = ['stamp'];
        this.gameModelsService.findStamp._retVal = this.model;
      });
      
      it('should create Spray centered on model', function() {
        expect(this.gameModelSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameModelsService.findStamp)
          .toHaveBeenCalledWith('stamp', 'models');
        
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('createTemplate', { x: 42, y: 71, type: 'spray' },
                                this.scope, this.scope.game);
      });
      
      it('should set model as spray\'s origin', function() {
        expect(this.sprayTemplateModeService.actions.clickModel)
          .toHaveBeenCalledWith(this.scope,
                                { target: this.model },
                                { ctrlKey: true });
      });
    });
  });
});
