describe('model model', function() {
  beforeEach(inject([
    'model',
    function(modelModel) {
      this.modelModel = modelModel;
    }
  ]));

  describe('unitIs(<unit>)', function() {
    example(function(e,d) {
      it('should check whether model\s unit number is <unit>, '+d, function() {
        expect(this.modelModel.unitIs(e.unit, {
          state: { u: 42 }
        })).toBe(e.is);
      });
    }, [
      ['unit' , 'is'  ],
      [ 42    , true  ],
      [ 71    , false ],
    ]);
  });

  describe('setUnit(<unit>)', function() {
    it('should set model\'s unit number', function() {
      this.model = {
        state: { stamp: 'stamp' }
      };

      this.model = this.modelModel.setUnit(42, this.model);

      expect(this.modelModel.unit(this.model))
        .toBe(42);
    });
  });

  describe('toggleUnitDisplay()', function() {
    it('should toggle unit display for <model>', function() {
      this.model = { state: { dsp: [] } };

      this.model = this.modelModel.toggleUnitDisplay(this.model);
      expect(this.modelModel.isUnitDisplayed(this.model))
        .toBeTruthy();

      this.model = this.modelModel.toggleUnitDisplay(this.model);
      expect(this.modelModel.isUnitDisplayed(this.model))
        .toBeFalsy();
    });
  });

  describe('setUnitDisplay(<set>)', function() {
    it('should set unit display for <model>', function() {
      this.model = { state: { dsp: [] } };

      this.model = this.modelModel.setUnitDisplay(true, this.model);
      expect(this.modelModel.isUnitDisplayed(this.model))
        .toBeTruthy();

      this.model = this.modelModel.setUnitDisplay(false, this.model);
      expect(this.modelModel.isUnitDisplayed(this.model))
        .toBeFalsy();
    });
  });
});
