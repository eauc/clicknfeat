'use strict';

describe('model image', function() {
  describe('modelsMode service', function() {
    beforeEach(inject([
      'modelsMode',
      function(modelsModeService) {
        this.modelsModeService = modelsModeService;

        this.gameService = spyOnService('game');
        this.gameModelsService = spyOnService('gameModels');
        mockReturnPromise(this.gameModelsService.findStamp);
        this.gameModelsService.findStamp.resolveWith = 'gameModels.findStamp.returnValue';

        this.gameModelSelectionService = spyOnService('gameModelSelection');
        this.gameModelSelectionService.get._retVal = ['stamp1','stamp2'];

        this.modelService = spyOnService('model');
     
        this.scope = { game: { models: 'models',
                               model_selection: 'selection' },
                       factions: 'factions'
                     };
      }
    ]));

    when('user toggles image display on models', function() {
      this.ret = this.modelsModeService.actions
        .toggleImageDisplay(this.scope);
    }, function() {
      using([
        ['first', 'set'],
        [ true  , false],
        [ false , true ],
      ], function(e, d) {
        when('first selected model\'s imageDisplayed is '+e.first, function() {
          this.modelService.isImageDisplayed._retVal = e.first;
        }, function() {
          it('should toggle image display on local selection, '+d, function() {
            expect(this.gameModelSelectionService.get)
              .toHaveBeenCalledWith('local', 'selection');
            expect(this.gameModelsService.findStamp)
              .toHaveBeenCalledWith('stamp1', 'models');
            this.thenExpect(this.ret, function(result) {
              expect(this.modelService.isImageDisplayed)
                .toHaveBeenCalledWith('gameModels.findStamp.returnValue');
              expect(this.gameService.executeCommand)
                .toHaveBeenCalledWith('onModels', 'setImageDisplay', e.set,
                                      this.gameModelSelectionService.get._retVal,
                                      this.scope, this.scope.game);
              expect(result).toBe('game.executeCommand.returnValue');
            });
          });
        });
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
                                this.gameModelSelectionService.get._retVal,
                                this.scope, this.scope.game);
      });
    });

    when('user toggles wreck display on models', function() {
      this.ret = this.modelsModeService.actions
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
            this.thenExpect(this.ret, function(result) {
              expect(this.modelService.isWreckDisplayed)
                .toHaveBeenCalledWith('gameModels.findStamp.returnValue');
              expect(this.gameService.executeCommand)
                .toHaveBeenCalledWith('onModels', 'setWreckDisplay', e.set,
                                      this.gameModelSelectionService.get._retVal,
                                      this.scope, this.scope.game);
              expect(result).toBe('game.executeCommand.returnValue');
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
        mockReturnPromise(this.gameFactionsService.getModelInfo);
      }
    ]));

    when('getImage(<factions>)', function() {
      this.ret = this.modelService.getImage('factions', this.model);
    }, function() {
      beforeEach(function() {
        this.gameFactionsService.getModelInfo.resolveWith = {
          img: [ { type: 'default', width: 60, height: 60, link: 'link' } ]
        };
        this.model = {
          state: { dsp:[], img: 0, info: 'info' }
        };
      });
      
      it('should fetch model info from <factions>', function() {
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
        describe(d, function() {
          beforeEach(function() {
            this.gameFactionsService.getModelInfo.resolveWith = { img: e.info_img };
            this.model = {
              state: { dsp: e.dsp, img: e.img, info: 'info' }
            };
          });
          
          it('should return image info for <model>, '+d, function() {
            this.thenExpect(this.ret, function(image) {
              expect(image).toEqual(e.result);
            });
          });
        });
      });

      using([
        [ 'info_img', 'is_leader', 'is_displayed', 'result' ],
        [ [ { type: 'default', width: 60, height: 60, link: 'link1' },
            { type: 'leader', width: 60, height: 60, link: 'link2' } ],
          true, true,
          { type: 'leader', width: 60, height: 60, link: 'link2' }
        ],
        // no leader image
        [ [ { type: 'default', width: 60, height: 60, link: 'link1' } ],
          true, true,
          { type: 'default', width: 60, height: 60, link: 'link1' }
        ],
        // not leader
        [ [ { type: 'default', width: 60, height: 60, link: 'link1' },
            { type: 'leader', width: 60, height: 60, link: 'link2' } ],
          false, true,
          { type: 'default', width: 60, height: 60, link: 'link1' }
        ],
        // image not displayed
        [ [ { type: 'default', width: 60, height: 60, link: 'link1' },
            { type: 'leader', width: 60, height: 60, link: 'link2' } ],
          true, false,
          { type: 'leader', width: 60, height: 60, link: null }
        ],
      ], function(e, d) {
        when('model is '+(e.is_leader ? '':'not ')+'a unit leader', function() {
          this.modelService.setLeaderDisplay(e.is_leader, this.model);
          this.modelService.setImageDisplay(e.is_displayed, this.model);
        }, function() {
          beforeEach(function() {
            this.gameFactionsService.getModelInfo.resolveWith = {
              img: e.info_img
            };
          });
          
          it('should return leader image info for <model> if it exists, '+d, function() {
            this.thenExpect(this.ret, function(image) {
              expect(image).toEqual(e.result);
            });
          });
        });
      });

      using([
        [ 'info_img', 'is_incorporeal', 'is_displayed', 'result' ],
        [ [ { type: 'default', width: 60, height: 60, link: 'link1' },
            { type: 'incorporeal', width: 60, height: 60, link: 'link2' } ], true, true,
          { type: 'incorporeal', width: 60, height: 60, link: 'link2' }
        ],
        // no incorporeal image
        [ [ { type: 'default', width: 60, height: 60, link: 'link1' } ], true, true,
          { type: 'default', width: 60, height: 60, link: 'link1' }
        ],
        // not incorporeal
        [ [ { type: 'default', width: 60, height: 60, link: 'link1' },
            { type: 'incorporeal', width: 60, height: 60, link: 'link2' } ], false, true,
          { type: 'default', width: 60, height: 60, link: 'link1' }
        ],
        // image not displayed
        [ [ { type: 'default', width: 60, height: 60, link: 'link1' },
            { type: 'incorporeal', width: 60, height: 60, link: 'link2' } ], true, false,
          { type: 'incorporeal', width: 60, height: 60, link: null }
        ],
      ], function(e, d) {
        when('model is incorporeal', function() {
          this.modelService.setIncorporealDisplay(e.is_incorporeal, this.model);
          this.modelService.setImageDisplay(e.is_displayed, this.model);
        }, function() {
          beforeEach(function() {
            this.gameFactionsService.getModelInfo.resolveWith = {
              img: e.info_img
            };
          });
          
          it('should return incorporeal image info for <model> if it exists, '+d, function() {
            this.thenExpect(this.ret, function(image) {
              expect(image).toEqual(e.result);
            });
          });
        });
      });
    });

    when('setNextImage(<factions>)', function() {
      this.ret = this.modelService.setNextImage('factions', this.model);
    }, function() {
      beforeEach(function() {
        this.model = {
          state: { dsp:[], img: 0, info: 'info' }
        };
        this.gameFactionsService.getModelInfo.resolveWith = {
          img: [ { type: 'default', width: 60, height: 60, link: 'link' } ]
        };
      });
      
      it('should fetch model info from <factions>', function() {
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
        describe(d, function() {
          beforeEach(function() {
            this.model = {
              state: { img: e.img, info: 'info' }
            };
            this.gameFactionsService.getModelInfo.resolveWith = {
              img: e.info_img
            };
          });
          
          it('should set next image <model>, '+d, function() {
            this.thenExpect(this.ret, function() {
              expect(this.model.state.img).toBe(e.next_img);
            });
          });
        });
      });
    });

    describe('toggleImageDisplay()', function() {
      it('should toggle image display for <model>', function() {
        this.model = { state: { dsp: [] } };
        
        this.modelService.toggleImageDisplay(this.model);
        expect(this.modelService.isImageDisplayed(this.model))
          .toBeTruthy();
        
        this.modelService.toggleImageDisplay(this.model);
        expect(this.modelService.isImageDisplayed(this.model))
          .toBeFalsy();
      });
    });

    describe('setImageDisplay(<set>)', function() {
      it('should set image display for <model>', function() {
        this.model = { state: { dsp: [] } };
        
        this.modelService.setImageDisplay(true, this.model);
        expect(this.modelService.isImageDisplayed(this.model))
          .toBeTruthy();
        
        this.modelService.setImageDisplay(false, this.model);
        expect(this.modelService.isImageDisplayed(this.model))
          .toBeFalsy();
      });
    });

    when('getWreckImage(<factions>)', function() {
      this.ret = this.modelService.getWreckImage('factions', this.model);
    }, function() {
      beforeEach(function() {
        this.model = {
          state: { dsp:[], img: 0, info: 'info' }
        };
        this.gameFactionsService.getModelInfo.resolveWith = {
          img: [ { type: 'default', width: 60, height: 60, link: 'link' } ]
        };
      });
      
      it('should fetch model info from <factions>', function() {
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
        describe(d, function() {
          beforeEach(function() {
            this.gameFactionsService.getModelInfo.resolveWith = {
              img: e.info_img
            };
            this.model = {
              state: { dsp: e.dsp, info: 'info' }
            };
          });

          it('should return image info for <model>, '+d, function() {
            this.thenExpect(this.ret, function(image) {
              expect(image).toEqual(e.result);
            });
          });
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
