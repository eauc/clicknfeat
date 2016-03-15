describe('model model', function() {
  beforeEach(inject([
    'model',
    function(modelModel) {
      this.modelModel = modelModel;
      this.gameFactionsModel = spyOnService('gameFactions');
    }
  ]));

  describe('toggleMeleeDisplay()', function() {
    it('should toggle melee display for <model>', function() {
      this.model = { state: { dsp: [] } };

      this.model = this.modelModel.toggleMeleeDisplay('melee', this.model);
      expect(this.modelModel.isMeleeDisplayed('melee', this.model))
        .toBeTruthy();

      this.model = this.modelModel.toggleMeleeDisplay('melee', this.model);
      expect(this.modelModel.isMeleeDisplayed('melee', this.model))
        .toBeFalsy();
    });
  });

  describe('setMeleeDisplay(<set>)', function() {
    it('should set melee display for <model>', function() {
      this.model = { state: { dsp: [] } };

      this.model = this.modelModel.setMeleeDisplay('melee', true, this.model);
      expect(this.modelModel.isMeleeDisplayed('melee', this.model))
        .toBeTruthy();

      this.model = this.modelModel.setMeleeDisplay('melee', false, this.model);
      expect(this.modelModel.isMeleeDisplayed('melee', this.model))
        .toBeFalsy();
    });
  });
});
