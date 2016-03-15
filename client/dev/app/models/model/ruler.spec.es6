describe('model ruler model', function() {
  beforeEach(inject([
    'model',
    function(modelModel) {
      this.modelModel = modelModel;
    }
  ]));

  describe('setRulerMaxLength(<length>)', function() {
    it('should set model\'s ruler max length', function() {
      this.model = { state: {} };

      this.model = this.modelModel
        .setRulerMaxLength(42, this.model);

      expect(this.modelModel.rulerMaxLength(this.model))
        .toBe(42);
    });
  });
});
