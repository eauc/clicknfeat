describe('model area model', function() {
  beforeEach(inject([
    'model',
    function(modelModel) {
      this.modelModel = modelModel;

      this.gameFactionsModel = spyOnService('gameFactions');
      this.gameFactionsModel.getModelInfo
        .and.returnValue({
          type: 'wardude',
          focus: 8
        });
    }
  ]));

  describe('toggleCtrlAreaDisplay()', function() {
    it('should toggle ctrlArea display for <model>', function() {
      this.model = { state: { dsp: [] } };

      this.model = this.modelModel.toggleCtrlAreaDisplay(this.model);
      return R.threadP(this.model)(
        this.modelModel.isCtrlAreaDisplayedP$('factions'),
        (result) => {
          expect(result).toBeTruthy();

          return this.modelModel.toggleCtrlAreaDisplay(this.model);
        },
        this.modelModel.isCtrlAreaDisplayedP$('factions'),
        (result) => {
          expect(result).toBeFalsy();
        }
      );
    });
  });

  describe('setCtrlAreaDisplay(<set>)', function() {
    it('should set ctrlArea display for <model>', function() {
      this.model = { state: { dsp: [] } };

      this.model = this.modelModel.setCtrlAreaDisplay(true, this.model);
      return R.threadP(this.model)(
        this.modelModel.isCtrlAreaDisplayedP$('factions'),
        (result) => {
          expect(result).toBeTruthy();

          return this.modelModel.setCtrlAreaDisplay(false, this.model);
        },
        this.modelModel.isCtrlAreaDisplayedP$('factions'),
        (result) => {
          expect(result).toBeFalsy();
        }
      );
    });
  });

  describe('toggleAreaDisplay()', function() {
    it('should toggle area display for <model>', function() {
      this.model = { state: { dsp: [] } };

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
      this.model = { state: { dsp: [] } };

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
