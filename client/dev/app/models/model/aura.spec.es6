describe('model aura model', function() {
  beforeEach(inject([
    'model',
    function(modelModel) {
      this.modelModel = modelModel;
    }
  ]));

  describe('toggleAuraDisplay()', function() {
    it('should toggle aura display for <model>', function() {
      this.model = { state: { dsp: [] } };

      this.model = this.modelModel.toggleAuraDisplay('aura', this.model);
      expect(this.modelModel.auraDisplay(this.model))
        .toBe('aura');
      expect(this.modelModel.isAuraDisplayed(this.model))
        .toBeTruthy();

      this.model = this.modelModel.toggleAuraDisplay('aura', this.model);
      expect(this.modelModel.auraDisplay(this.model))
        .toBe(null);
      expect(this.modelModel.isAuraDisplayed(this.model))
        .toBeFalsy();
    });
  });

  describe('setAuraDisplay(<set>)', function() {
    it('should set aura display for <model>', function() {
      this.model = { state: { dsp: [] } };

      this.model = this.modelModel.setAuraDisplay('aura', this.model);
      expect(this.modelModel.auraDisplay(this.model))
        .toBe('aura');
      expect(this.modelModel.isAuraDisplayed(this.model))
        .toBeTruthy();

      this.model = this.modelModel.setAuraDisplay(null, this.model);
      expect(this.modelModel.auraDisplay(this.model))
        .toBe(null);
      expect(this.modelModel.isAuraDisplayed(this.model))
        .toBeFalsy();
    });
  });
});
