describe('model area model', function() {
  beforeEach(inject([
    'model',
    function(modelModel) {
      this.modelModel = modelModel;

      this.info = {
        type: 'wardude',
        focus: 8
      };
    }
  ]));

  describe('toggleCtrlAreaDisplay()', function() {
    it('should toggle ctrlArea display for <model>', function() {
      this.model = { info: this.info,
                     state: { dsp: [] } };

      this.model = this.modelModel.toggleCtrlAreaDisplay(this.model);
      expect(this.modelModel.isCtrlAreaDisplayed(this.model))
        .toBeTruthy();

      this.model = this.modelModel.toggleCtrlAreaDisplay(this.model);
      expect(this.modelModel.isCtrlAreaDisplayed(this.model))
        .toBeFalsy();
    });
  });

  describe('setCtrlAreaDisplay(<set>)', function() {
    it('should set ctrlArea display for <model>', function() {
      this.model = { info: this.info,
                     state: { dsp: [] } };

      this.model = this.modelModel.setCtrlAreaDisplay(true, this.model);
      expect(this.modelModel.isCtrlAreaDisplayed(this.model))
        .toBeTruthy();

      this.model = this.modelModel.setCtrlAreaDisplay(false, this.model);
      expect(this.modelModel.isCtrlAreaDisplayed(this.model))
        .toBeFalsy();
    });
  });

  describe('toggleAreaDisplay()', function() {
    it('should toggle area display for <model>', function() {
      this.model = { info: this.info,
                     state: { dsp: [] } };

      this.model = this.modelModel.toggleAreaDisplay('area', this.model);
      expect(this.modelModel.areaDisplay(this.model))
        .toBe('area');
      expect(this.modelModel.isAreaDisplayed(this.model))
        .toBeTruthy();

      this.model = this.modelModel.toggleAreaDisplay('area', this.model);
      expect(this.modelModel.areaDisplay(this.model))
        .toBe(null);
      expect(this.modelModel.isAreaDisplayed(this.model))
        .toBeFalsy();
    });
  });

  describe('setAreaDisplay(<set>)', function() {
    it('should set area display for <model>', function() {
      this.model = { info: this.info,
                     state: { dsp: [] } };

      this.model = this.modelModel.setAreaDisplay('area', this.model);
      expect(this.modelModel.areaDisplay(this.model))
        .toBe('area');
      expect(this.modelModel.isAreaDisplayed(this.model))
        .toBeTruthy();

      this.model = this.modelModel.setAreaDisplay(null, this.model);
      expect(this.modelModel.areaDisplay(this.model))
        .toBe(null);
      expect(this.modelModel.isAreaDisplayed(this.model))
        .toBeFalsy();
    });
  });
});
