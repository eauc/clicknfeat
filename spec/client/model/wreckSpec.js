'use strict';

describe('model wreck', function() {
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

    when('user toggles wreck display on models', function() {
      this.modelsModeService.actions
        .toggleWreckDisplay(this.scope);
    }, function() {
      using([
        ['first', 'set'],
        [ true  , false],
        [ false , true ],
      ], function(e, d) {
        when('first selected model\'s wreckDisplayed is '+e.first, function() {
          this.modelService.isWreckDisplayed._retVal = e.first;
        }, function() {
          it('should toggle wreck display on local selection, '+d, function() {
            expect(this.gameModelSelectionService.get)
              .toHaveBeenCalledWith('local', 'selection');
            expect(this.gameModelsService.findStamp)
              .toHaveBeenCalledWith('stamp1', 'models');
            expect(this.modelService.isWreckDisplayed)
              .toHaveBeenCalledWith('gameModels.findStamp.returnValue');
            expect(this.gameService.executeCommand)
              .toHaveBeenCalledWith('onModels', 'setWreckDisplay', e.set,
                                    this.gameModelSelectionService.get._retVal,
                                    this.scope, this.scope.game);
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

    describe('getWreckImage(<factions>)', function() {
      it('should fetch model info from <factions>', function() {
        this.gameFactionsService.getModelInfo._retVal = {
          img: [ { type: 'default', width: 60, height: 60, link: 'link' } ]
        };

        this.modelService.getImage('factions', {
          state: { dsp:[], img: 0, info: 'info' }
        });

        expect(this.gameFactionsService.getModelInfo)
          .toHaveBeenCalledWith('info', 'factions');
      });

      using([
        [ 'info_img', 'dsp', 'result' ],
        // now wreck -> return first default without link
        [ [ { type: 'default', width: 60, height: 60, link: 'link' } ], ['w'],
          { type: 'default', width: 60, height: 60, link: null }
        ],
        // info has multiple images > return wreck image
        [ [ { type: 'default', width: 60, height: 60, link: 'link1' },
            { type: 'wreck', width: 60, height: 60, link: 'link2' },
            { type: 'default', width: 180, height: 180, link: 'link3' } ], ['i'],
          { type: 'wreck', width: 60, height: 60, link: 'link2' }
        ],
        // image not displayed > return wreck image without link
        [ [ { type: 'default', width: 60, height: 60, link: 'link1' },
            { type: 'wreck', width: 60, height: 60, link: 'link2' },
            { type: 'default', width: 180, height: 180, link: 'link3' } ], ['a'],
          { type: 'wreck', width: 60, height: 60, link: null }
        ],
      ], function(e, d) {
        it('should return image info for <model>, '+d, function() {
          this.gameFactionsService.getModelInfo._retVal = {
            img: e.info_img
          };
          
          expect(this.modelService.getWreckImage('factions', {
            state: { dsp: e.dsp, info: 'info' }
          })).toEqual(e.result);
        });
      });
    });

    describe('toggleWreckDisplay()', function() {
      it('should toggle wreck display for <model>', function() {
        this.model = { state: { dsp: [] } };
        
        this.modelService.toggleWreckDisplay(this.model);
        expect(this.modelService.isWreckDisplayed(this.model))
          .toBeTruthy();
        
        this.modelService.toggleWreckDisplay(this.model);
        expect(this.modelService.isWreckDisplayed(this.model))
          .toBeFalsy();
      });
    });

    describe('setWreckDisplay(<set>)', function() {
      it('should set wreck display for <model>', function() {
        this.model = { state: { dsp: [] } };
        
        this.modelService.setWreckDisplay(true, this.model);
        expect(this.modelService.isWreckDisplayed(this.model))
          .toBeTruthy();
        
        this.modelService.setWreckDisplay(false, this.model);
        expect(this.modelService.isWreckDisplayed(this.model))
          .toBeFalsy();
      });
    });
  });
});
