'use strict';

describe('model create template', function() {
  describe('modelMode service', function() {
    beforeEach(inject([
      'modelBaseMode',
      function(modelBaseModeService) {
        this.modelBaseModeService = modelBaseModeService;

        this.gameService = spyOnService('game');
        mockReturnPromise(this.gameService.executeCommand);
        this.gameService.executeCommand.resolveWith = 'game.executeCommand.returnValue';
        
        this.gameModelsService = spyOnService('gameModels');
        mockReturnPromise(this.gameModelsService.findStamp);
        this.gameModelsService.findStamp.resolveWith = 'gameModels.findStamp.returnValue';
        
        this.gameModelSelectionService = spyOnService('gameModelSelection');

        this.sprayTemplateModeService = spyOnService('sprayTemplateMode');
        spyOn(this.sprayTemplateModeService.actions, 'setOriginModel');
        this.sprayTemplateModeService.actions.setOriginModel
          .and.returnValue('sprayTemplateMode.setOriginModel.returnValue');
      
        this.scope = { game: { model_selection: 'selection',
                               models: 'models'
                             },
                       factions: 'factions'
                     };
      }
    ]));

    when('user create AoE on model', function() {
      this.ret = this.modelBaseModeService.actions
        .createAoEOnModel(this.scope);
    }, function() {
      beforeEach(function() {
        this.gameModelSelectionService.get._retVal = ['stamp'];
        this.gameModelsService.findStamp.resolveWith = {
          state: { x: 42, y: 71 }
        };
      });
      
      it('should create AoE centered on model', function() {
        this.thenExpect(this.ret, function(result) {
          expect(this.gameModelSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
          expect(this.gameModelsService.findStamp)
            .toHaveBeenCalledWith('stamp', 'models');
        
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('createTemplate', [{ x: 42, y: 71, type: 'aoe' }],
                                  this.scope, this.scope.game);
          expect(result).toBe('game.executeCommand.returnValue');
        });
      });
    });

    when('user create spray on model', function() {
      this.ret = this.modelBaseModeService.actions
        .createSprayOnModel(this.scope);
    }, function() {
      beforeEach(function() {
        this.model = {
          state: { stamp: 'stamp', x: 42, y: 71 }
        };
        this.gameModelSelectionService.get._retVal = ['stamp'];
        this.gameModelsService.findStamp.resolveWith = this.model;
      });
      
      it('should create Spray centered on model', function() {
        this.thenExpect(this.ret, function() {
          expect(this.gameModelSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
          expect(this.gameModelsService.findStamp)
            .toHaveBeenCalledWith('stamp', 'models');
        
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('createTemplate', [{ x: 42, y: 71, type: 'spray' }],
                                  this.scope, this.scope.game);
        });
      });
      
      it('should set model as spray\'s origin', function() {
        this.thenExpect(this.ret, function(result) {
          expect(this.sprayTemplateModeService.actions.setOriginModel)
            .toHaveBeenCalledWith(this.scope,
                                  { 'click#': { target: this.model } });

          expect(result).toBe('sprayTemplateMode.setOriginModel.returnValue');
        });
      });
    });
  });
});
