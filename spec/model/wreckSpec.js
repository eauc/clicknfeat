'use strict';

describe('model wreck', function() {
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

    when('user toggles wreck display on models', function() {
      this.modelsModeService.actions
        .toggleWreckDisplay(this.scope);
    }, function() {
      it('should toggle wreck display on local selection', function() {
        expect(this.gameModelSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('onModels', 'toggleWreckDisplay',
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
      }
    ]));

    describe('isWreckDisplayed', function() {
      using([
        [ 'dsp'         , 'isDisplayed' ],
        [ []            , false ],
        [ ['a', 'r']    , false ],
        [ ['w']         , true ],
        [ ['a','w','r'] , true ],
      ], function(e, d) {
        it('should check whether model\'s wreck is displayed, '+d, function() {
          expect(this.modelService.isWreckDisplayed({
            state: { dsp: e.dsp }
          })).toBe(e.isDisplayed);
        });
      });
    });

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
      using([
        [ 'dsp'         , 'new_dsp'     ],
        [ []            , ['w']         ],
        [ ['w']         , []            ],
        [ ['a','r']     , ['a','r','w'] ],
        [ ['a','w','r'] , ['a','r']     ],
      ], function(e, d) {
        it('should toggle wreck display for <model>, '+d, function() {
          this.model = {
            state: { dsp: e.dsp }
          };
          
          this.modelService.toggleWreckDisplay(this.model);

          expect(this.model.state.dsp).toEqual(e.new_dsp);
        });
      });
    });
  });
});
