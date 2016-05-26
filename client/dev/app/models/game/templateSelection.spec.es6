describe('gameTemplateSelection model', function() {
  beforeEach(inject([
    'gameTemplateSelection',
    function(gameTemplateSelectionModel) {
      this.gameTemplateSelectionModel = gameTemplateSelectionModel;

      this.gameTemplatesModel = spyOnService('gameTemplates');
    }
  ]));

  context('checkMode(<templates>)', function() {
    return this.gameTemplateSelectionModel
      .checkMode('templates', this.selection);
  }, function() {
    context('when local <selection> is empty', function() {
      this.selection = { local: [] };
    }, function() {
      it('should return null', function() {
        expect(this.context).toBe(null);
      });
    });

    context('when first selected template is not found', function() {
      this.selection = { local: ['stamp'] };
      this.gameTemplatesModel.findStamp
        .and.returnValue(null);
    }, function() {
      it('should return null', function() {
        expect(this.gameTemplatesModel.findStamp)
          .toHaveBeenCalledWith('stamp', 'templates');
        expect(this.context).toBe(null);
      });
    });

    context('when first selected template is not found', function() {
      this.selection = { local: ['stamp'] };
      this.gameTemplatesModel.findStamp
        .and.returnValue({ state: { type: 'type' } });
    }, function() {
      it('should return mode for template type', function() {
        expect(this.gameTemplatesModel.findStamp)
          .toHaveBeenCalledWith('stamp', 'templates');
        expect(this.context).toBe('typeTemplate');
      });
    });
  });
});
