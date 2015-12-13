'use strict';

xdescribe('model b2b', function() {
  describe('modelMode service', function() {
    beforeEach(inject([
      'modelMode',
      function(modelModeService) {
        this.modelModeService = modelModeService;
        this.gameService = spyOnService('game');
        this.gameModelsService = spyOnService('gameModels');
        this.gameModelSelectionService = spyOnService('gameModelSelection');
        this.modelsModeService = spyOnService('modelsMode');
        spyOn(this.modelsModeService.actions, 'clickModel');
      
        this.scope = { game: { model_selection: 'selection' },
                       factions: 'factions'
                     };
      }
    ]));

    when('user toggles shift+click on model', function() {
      this.modelModeService.actions
        .clickModel(this.scope, this.event, { shiftKey: true, ctrlKey: true });
    }, function() {
      beforeEach(function() {
        this.event = {
          target: { state: { stamp: 'target' } }
        };
        this.gameModelSelectionService.get._retVal = ['stamp'];
        this.gameModelsService.findStamp._retVal = {
          state: { stamp: 'stamp' }
        };
      });

      when('<target> is the selected model', function() {
        this.event.target.state.stamp = 'stamp';
      }, function() {
        it('should fwd event to modelsMode', function() {
          expect(this.modelsModeService.actions.clickModel)
            .toHaveBeenCalledWith(this.scope, this.event,
                                  { shiftKey: true, ctrlKey: true });
        });
      });

      when('<target> is not the selected model', function() {
        this.event.target.state.stamp = 'target';
      }, function() {
        it('should fwd event to modelsMode', function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onModels', 'setB2B',
                                  'factions', this.event.target, ['stamp'],
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

    describe('distanceTo(<factions>, <other>)', function() {
      beforeEach(function() {
        this.fake_info = {
          info: { base_radius: 9.842 },
          other_info: { base_radius: 7.874 },
        };
        this.gameFactionsService.getModelInfo.and.callFake((i) => {
          return this.fake_info[i];
        });
      });

      using([
        ['model_pos', 'distance'],
        [{ x:240, y:240 }, 10.568271247461904 ],
        [{ x:245, y:245 }, 3.4972034355964263 ],
        [{ x:250, y:250 }, -3.573864376269049 ],
      ], function(e, d) {
        it('should return distance between both models, '+d, function() {
          expect(this.modelService.distanceTo('factions', {
            state: { info: 'other_info',
                     x: 260, y: 260 }
          }, {
            state: R.merge({ info: 'info'}, e.model_pos)
          })).toBe(e.distance);
        });
      });
    });

    when('setB2B(<factions>, <other>)', function() {
      this.modelService.setB2B('factions', {
        state: { info: 'other_info',
                 x: 260, y: 260 }
      }, this.model);
    }, function() {
      beforeEach(function() {
        this.fake_info = {
          info: { base_radius: 9.842 },
          other_info: { base_radius: 7.874 },
        };
        this.gameFactionsService.getModelInfo.and.callFake((i) => {
          return this.fake_info[i];
        });
        this.model = {
          state: { info: 'info',
                   x: 240, y: 240 }
        };
      });

      it('should move model B2B with <other>', function() {
        expect(R.pick(['x','y'], this.model.state))
          .toEqual({ x: 247.47289626449913, y: 247.47289626449913 });
      });
      
      when('model is locked', function() {
        this.modelService.setLock(true, this.model);
      }, function() {
        it('should not move model', function() {
          expect(R.pick(['x','y'], this.model.state))
            .toEqual({ x: 240, y: 240 });
        });
      });
    });
  });
});
