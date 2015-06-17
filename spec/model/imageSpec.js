'use strict';

describe('model image', function() {
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

    when('user toggles image display on models', function() {
      this.modelsModeService.actions
        .toggleImageDisplay(this.scope);
    }, function() {
      it('should toggle image display on local selection', function() {
        expect(this.gameModelSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('onModels', 'toggleImageDisplay',
                                'gameModelSelection.get.returnValue',
                                this.scope, this.scope.game);
      });
    });

    when('user set next image on models', function() {
      this.modelsModeService.actions
        .setNextImage(this.scope);
    }, function() {
      it('should set next image on local selection', function() {
        expect(this.gameModelSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('onModels', 'setNextImage', 'factions',
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

    describe('isImageDisplayed', function() {
      using([
        [ 'dsp'         , 'isDisplayed' ],
        [ []            , false ],
        [ ['a', 'r']    , false ],
        [ ['i']         , true ],
        [ ['a','i','r'] , true ],
      ], function(e, d) {
        it('should check whether model\'s image is displayed, '+d, function() {
          expect(this.modelService.isImageDisplayed({
            state: { dsp: e.dsp }
          })).toBe(e.isDisplayed);
        });
      });
    });

    describe('getImage(<factions>)', function() {
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
        [ 'info_img', 'dsp', 'img', 'result' ],
        // standard case
        [ [ { type: 'default', width: 60, height: 60, link: 'link' } ], ['i'], 0,
          { type: 'default', width: 60, height: 60, link: 'link' }
        ],
        // info has no image -> it's ok
        [ [ { type: 'default', width: 60, height: 60 } ], ['i'], 0,
          { type: 'default', width: 60, height: 60, link: undefined }
        ],
        // image is not displayed
        [ [ { type: 'default', width: 60, height: 60, link: 'link' } ], ['a','r'], 0,
          { type: 'default', width: 60, height: 60, link: null }
        ],
        // info has multiple images > return image indexed by state.img
        [ [ { type: 'default', width: 60, height: 60, link: 'link1' },
            { type: 'default', width: 60, height: 60, link: 'link2' },
            { type: 'default', width: 180, height: 180, link: 'link3' } ], ['i'], 2,
          { type: 'default', width: 180, height: 180, link: 'link3' }
        ],
        [ [ { type: 'default', width: 60, height: 60, link: 'link1' },
            { type: 'default', width: 60, height: 60, link: 'link2' },
            { type: 'default', width: 180, height: 180, link: 'link3' } ], ['i'], 1,
          { type: 'default', width: 60, height: 60, link: 'link2' }
        ],
        // info has multiple images > skip image with type !== 'default'
        [ [ { type: 'default', width: 60, height: 60, link: 'link1' },
            { type: 'wreck', width: 60, height: 60, link: 'link2' },
            { type: 'default', width: 180, height: 180, link: 'link3' } ], ['i'], 1,
          { type: 'default', width: 180, height: 180, link: 'link3' }
        ],
      ], function(e, d) {
        it('should return image info for <model>, '+d, function() {
          this.gameFactionsService.getModelInfo._retVal = {
            img: e.info_img
          };
          
          expect(this.modelService.getImage('factions', {
            state: { dsp: e.dsp, img: e.img, info: 'info' }
          })).toEqual(e.result);
        });
      });
    });

    describe('setNextImage(<factions>)', function() {
      it('should fetch model info from <factions>', function() {
        this.gameFactionsService.getModelInfo._retVal = {
          img: [ { type: 'default', width: 60, height: 60, link: 'link' } ]
        };

        this.modelService.setNextImage('factions', {
          state: { dsp:[], img: 0, info: 'info' }
        });

        expect(this.gameFactionsService.getModelInfo)
          .toHaveBeenCalledWith('info', 'factions');
      });

      using([
        [ 'info_img', 'img', 'next_img' ],
        // standard case, one image -> no change
        [ [ { type: 'default', width: 60, height: 60, link: 'link' } ], 0, 0 ],
        // info has multiple images -> increment index
        [ [ { type: 'default', width: 60, height: 60, link: 'link1' },
            { type: 'default', width: 60, height: 60, link: 'link2' },
            { type: 'default', width: 180, height: 180, link: 'link3' } ], 0, 1 ],
        // info has multiple images -> wrap around
        [ [ { type: 'default', width: 60, height: 60, link: 'link1' },
            { type: 'default', width: 60, height: 60, link: 'link2' },
            { type: 'default', width: 180, height: 180, link: 'link3' } ], 2, 0 ],
        // info has multiple images -> skip images type !== 'default'
        [ [ { type: 'default', width: 60, height: 60, link: 'link1' },
            { type: 'wreck', width: 60, height: 60, link: 'link2' },
            { type: 'default', width: 180, height: 180, link: 'link3' } ], 1, 0 ],
      ], function(e, d) {
        it('should set next image <model>, '+d, function() {
          this.gameFactionsService.getModelInfo._retVal = {
            img: e.info_img
          };
          this.model = {
            state: { img: e.img, info: 'info' }
          };
          
          this.modelService.setNextImage('factions', this.model);

          expect(this.model.state.img).toBe(e.next_img);
        });
      });
    });

    describe('toggleImageDisplay()', function() {
      using([
        [ 'dsp'         , 'new_dsp'     ],
        [ []            , ['i']         ],
        [ ['i']         , []            ],
        [ ['a','r']     , ['a','r','i'] ],
        [ ['a','i','r'] , ['a','r']     ],
      ], function(e, d) {
        it('should toggle image display for <model>, '+d, function() {
          this.model = {
            state: { dsp: e.dsp }
          };
          
          this.modelService.toggleImageDisplay(this.model);

          expect(this.model.state.dsp).toEqual(e.new_dsp);
        });
      });
    });
  });
});
