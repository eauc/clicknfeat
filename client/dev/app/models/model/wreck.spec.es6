describe('model model', function() {
  beforeEach(inject([
    'model',
    function(modelModel) {
      this.modelModel = modelModel;
      this.gameFactionsModel = spyOnService('gameFactions');
    }
  ]));

  context('getWreckImageP(<factions>)', function() {
    return this.modelModel.getWreckImageP('factions', this.model);
  }, function() {
    beforeEach(function() {
      this.model = {
        state: { dsp:[], img: 0, info: 'info' }
      };
      this.gameFactionsModel.getModelInfoP.resolveWith({
        img: [ { type: 'default', width: 60, height: 60, link: 'link' } ]
      });
    });

    it('should fetch model info from <factions>', function() {
      expect(this.gameFactionsModel.getModelInfoP)
        .toHaveBeenCalledWith('info', 'factions');
    });

    example(function(e, d) {
      describe(d, function() {
        beforeEach(function() {
          this.gameFactionsModel.getModelInfoP
            .resolveWith({ img: e.info_img });
          this.model = {
            state: { dsp: e.dsp, info: 'info' }
          };
        });

        it('should return image info for <model>, '+d, function() {
          expect(this.context).toEqual(e.result);
        });
      });
    }, [
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
    ]);
  });

  describe('toggleWreckDisplay()', function() {
    it('should toggle wreck display for <model>', function() {
      this.model = { state: { dsp: [] } };

      this.model = this.modelModel.toggleWreckDisplay(this.model);
      expect(this.modelModel.isWreckDisplayed(this.model))
        .toBeTruthy();

      this.model = this.modelModel.toggleWreckDisplay(this.model);
      expect(this.modelModel.isWreckDisplayed(this.model))
        .toBeFalsy();
    });
  });

  describe('setWreckDisplay(<set>)', function() {
    it('should set wreck display for <model>', function() {
      this.model = { state: { dsp: [] } };

      this.model = this.modelModel.setWreckDisplay(true, this.model);
      expect(this.modelModel.isWreckDisplayed(this.model))
        .toBeTruthy();

      this.model = this.modelModel.setWreckDisplay(false, this.model);
      expect(this.modelModel.isWreckDisplayed(this.model))
        .toBeFalsy();
    });
  });
});
