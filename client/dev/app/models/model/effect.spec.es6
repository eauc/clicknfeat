describe('model effect model', function() {
  beforeEach(inject([
    'model',
    function(modelModel) {
      this.modelModel = modelModel;
    }
  ]));

  describe('toggleLeaderDisplay()', function() {
    it('should toggle leader display for <model>', function() {
      this.model = { state: { dsp: [] } };

      this.model = this.modelModel.toggleLeaderDisplay(this.model);
      expect(this.modelModel.isLeaderDisplayed(this.model))
        .toBeTruthy();

      this.model = this.modelModel.toggleLeaderDisplay(this.model);
      expect(this.modelModel.isLeaderDisplayed(this.model))
        .toBeFalsy();
    });
  });

  describe('setLeaderDisplay(<set>)', function() {
    it('should set leader display for <model>', function() {
      this.model = { state: { dsp: [] } };

      this.model = this.modelModel.setLeaderDisplay(true, this.model);
      expect(this.modelModel.isLeaderDisplayed(this.model))
        .toBeTruthy();

      this.model = this.modelModel.setLeaderDisplay(false, this.model);
      expect(this.modelModel.isLeaderDisplayed(this.model))
        .toBeFalsy();
    });
  });

  describe('toggleIncorporealDisplay()', function() {
    it('should toggle incorporeal display for <model>', function() {
      this.model = { state: { dsp: [] } };

      this.model = this.modelModel.toggleIncorporealDisplay(this.model);
      expect(this.modelModel.isIncorporealDisplayed(this.model))
        .toBeTruthy();

      this.model = this.modelModel.toggleIncorporealDisplay(this.model);
      expect(this.modelModel.isIncorporealDisplayed(this.model))
        .toBeFalsy();
    });
  });

  describe('setIncorporealDisplay(<set>)', function() {
    it('should set incorporeal display for <model>', function() {
      this.model = { state: { dsp: [] } };

      this.model = this.modelModel.setIncorporealDisplay(true, this.model);
      expect(this.modelModel.isIncorporealDisplayed(this.model))
        .toBeTruthy();

      this.model = this.modelModel.setIncorporealDisplay(false, this.model);
      expect(this.modelModel.isIncorporealDisplayed(this.model))
        .toBeFalsy();
    });
  });

  example(function(ee) {
    describe('toggleEffectDisplay(<effect>)', function() {
      it('should toggle effect display for <model>', function() {
        this.model = { state: { eff: [] } };

        this.model = this.modelModel.toggleEffectDisplay(ee.flag, this.model);
        expect(this.modelModel.isEffectDisplayed(ee.flag, this.model))
          .toBeTruthy();

        this.model = this.modelModel.toggleEffectDisplay(ee.flag, this.model);
        expect(this.modelModel.isEffectDisplayed(ee.flag, this.model))
          .toBeFalsy();
      });
    });

    describe('setEffectDisplay(<set>)', function() {
      it('should set effect display for <model>', function() {
        this.model = { state: { eff: [] } };

        this.model = this.modelModel.setEffectDisplay(ee.flag, true, this.model);
        expect(this.modelModel.isEffectDisplayed(ee.flag, this.model))
          .toBeTruthy();

        this.model = this.modelModel.setEffectDisplay(ee.flag, false, this.model);
        expect(this.modelModel.isEffectDisplayed(ee.flag, this.model))
          .toBeFalsy();
      });
    });
  }, [
    [ 'effect'     , 'flag' ],
    [ 'Blind'      , 'b'    ],
    [ 'Corrosion'  , 'c'    ],
    [ 'Disrupt'    , 'd'    ],
    [ 'Fire'       , 'f'    ],
    [ 'Fleeing'    , 'r'    ],
    [ 'KD'         , 'k'    ],
    [ 'Stationary' , 's'    ],
  ]);
});
