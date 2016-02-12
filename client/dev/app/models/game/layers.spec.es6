describe('gameLayers model', function() {
  beforeEach(inject([
    'gameLayers', function(gameLayersModel) {
      this.gameLayersModel = gameLayersModel;
    }
  ]));

  describe('create()', function() {
    it('should init layers', function() {
      expect(this.gameLayersModel.create())
        .toEqual(['b','d','s','m','t']);
    });
  });

  describe('set(<l>)', function() {
    it('should display <l> layer', function() {
      this.layers = [];
      this.layers = this.gameLayersModel.set('l', this.layers);
      expect(this.gameLayersModel.isDisplayed('l', this.layers))
        .toBeTruthy();
    });
  });

  describe('unset(<l>)', function() {
    beforeEach(function() {
      this.layers = this.gameLayersModel.set('l', []);
    });

    it('should undisplay <l> layer', function() {
      this.layers = this.gameLayersModel.unset('l', this.layers);
      expect(this.gameLayersModel.isDisplayed('l', this.layers))
        .toBeFalsy();
    });
  });

  describe('toggle(<l>)', function() {
    beforeEach(function() {
      this.layers = this.gameLayersModel.set('l', []);
    });

    it('should switch display for <l> layer', function() {
      this.layers = this.gameLayersModel.toggle('l', this.layers);
      expect(this.gameLayersModel.isDisplayed('l', this.layers))
        .toBeFalsy();

      this.layers = this.gameLayersModel.toggle('l', this.layers);
      expect(this.gameLayersModel.isDisplayed('l', this.layers))
        .toBeTruthy();
    });
  });
});
