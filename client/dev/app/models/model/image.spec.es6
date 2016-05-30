describe('model image model', function() {
  beforeEach(inject([
    'model',
    function(modelModel) {
      this.modelModel = modelModel;
    }
  ]));

  context('getImage()', function() {
    return this.modelModel
      .getImage(this.model);
  }, function() {
    beforeEach(function() {
      this.model = {
        info: { img: [ { type: 'default', width: 60, height: 60, link: 'link' } ] },
        state: { dsp:[], img: 0, info: 'info' }
      };
    });

    example(function(e, d) {
      describe(d, function() {
        beforeEach(function() {
          this.model = {
            info: { img: e.info_img },
            state: { dsp: e.dsp, img: e.img, info: 'info' }
          };
        });

        it('should return image info for <model>, '+d, function() {
          expect(this.context).toEqual(e.result);
        });
      });
    }, [
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
    ]);

    example(function(e, d) {
      context(`when model is ${e.is_leader ? '':'not '}a unit leader`, function() {
        this.model = this.modelModel.setLeaderDisplay(e.is_leader, this.model);
        this.model = this.modelModel.setImageDisplay(e.is_displayed, this.model);
      }, function() {
        beforeEach(function() {
          this.model.info.img = e.info_img;
        });

        it(`should return leader image info for <model> if it exists, ${d}`, function() {
          expect(this.context).toEqual(e.result);
        });
      });
    }, [
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
    ]);

    example(function(e, d) {
      context('when model is incorporeal', function() {
        this.model = this.modelModel.setIncorporealDisplay(e.is_incorporeal, this.model);
        this.model = this.modelModel.setImageDisplay(e.is_displayed, this.model);
      }, function() {
        beforeEach(function() {
          this.model.info.img = e.info_img;
        });

        it(`should return incorporeal image info for <model> if it exists, ${d}`, function() {
          expect(this.context).toEqual(e.result);
        });
      });
    }, [
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
    ]);
  });

  context('setNextImage()', function() {
    return this.modelModel.setNextImage(this.model);
  }, function() {
    beforeEach(function() {
      this.model = {
        info: { img: [ { type: 'default', width: 60, height: 60, link: 'link' } ] },
        state: { dsp:[], img: 0, info: 'info' }
      };
    });

    example(function(e, d) {
      describe(d, function() {
        beforeEach(function() {
          this.model = {
            info: { img: e.info_img },
            state: { img: e.img, info: 'info' }
          };
        });

        it(`should set next image <model>, ${d}`, function() {
          expect(this.context.state.img).toBe(e.next_img);
        });
      });
    }, [
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
    ]);
  });

  describe('toggleImageDisplay()', function() {
    it('should toggle image display for <model>', function() {
      this.model = { state: { dsp: [] } };

      this.model = this.modelModel.toggleImageDisplay(this.model);
      expect(this.modelModel.isImageDisplayed(this.model))
        .toBeTruthy();

      this.model = this.modelModel.toggleImageDisplay(this.model);
      expect(this.modelModel.isImageDisplayed(this.model))
        .toBeFalsy();
    });
  });

  describe('setImageDisplay(<set>)', function() {
    it('should set image display for <model>', function() {
      this.model = { state: { dsp: [] } };

      this.model = this.modelModel.setImageDisplay(true, this.model);
      expect(this.modelModel.isImageDisplayed(this.model))
        .toBeTruthy();

      this.model = this.modelModel.setImageDisplay(false, this.model);
      expect(this.modelModel.isImageDisplayed(this.model))
        .toBeFalsy();
    });
  });
});
