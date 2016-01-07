describe('model create template', function() {
  describe('modelBaseMode service', function() {
    beforeEach(inject([
      'modelBaseMode',
      function(modelBaseModeService) {
        this.modelBaseModeService = modelBaseModeService;

        this.gameModelsService = spyOnService('gameModels');
        mockReturnPromise(this.gameModelsService.findStamp);
        this.gameModelsService.findStamp.resolveWith = 'gameModels.findStamp.returnValue';
        
        this.gameModelSelectionService = spyOnService('gameModelSelection');

        this.sprayTemplateModeService = spyOnService('sprayTemplateMode');
        spyOn(this.sprayTemplateModeService.actions, 'setOriginModel');
        this.sprayTemplateModeService.actions.setOriginModel
          .and.returnValue('sprayTemplateMode.setOriginModel.returnValue');
      
        this.state = { game: { model_selection: 'selection',
                               models: 'models'
                             },
                       factions: 'factions',
                       ui_state: { flip_map: 'flip' },
                       event: jasmine.createSpy('event')
                     };
      }
    ]));

    when('user create AoE on model', function() {
      this.ret = this.modelBaseModeService.actions
        .createAoEOnModel(this.state);
    }, function() {
      beforeEach(function() {
        this.gameModelSelectionService.get._retVal = ['stamp'];
        this.gameModelsService.findStamp.resolveWith = {
          state: { x: 42, y: 71 }
        };
      });
      
      it('should create AoE centered on model', function() {
        this.thenExpect(this.ret, function() {
          expect(this.gameModelSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
          expect(this.gameModelsService.findStamp)
            .toHaveBeenCalledWith('stamp', 'models');
        
          expect(this.state.event)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'createTemplate', [ { base: { x: 0, y: 0 },
                                                        templates: [ { x: 42, y: 71, type: 'aoe' } ]
                                                      }, 'flip' ]);
        });
      });
    });

    when('user create spray on model', function() {
      this.ret = this.modelBaseModeService.actions
        .createSprayOnModel(this.state);
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
        
          expect(this.state.event)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'createTemplate', [ { base: { x: 0, y: 0 },
                                                        templates: [ { x: 42, y: 71, type: 'spray' } ]
                                                      }, 'flip' ]);
        });
      });
      
      it('should set model as spray\'s origin', function() {
        this.thenExpect(this.ret, function(result) {
          expect(this.sprayTemplateModeService.actions.setOriginModel)
            .toHaveBeenCalledWith(this.state,
                                  { 'click#': { target: this.model } });

          expect(result).toBe('sprayTemplateMode.setOriginModel.returnValue');
        });
      });
    });
  });
});
