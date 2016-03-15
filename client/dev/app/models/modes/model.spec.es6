describe('modelMode model', function() {
  beforeEach(inject([
    'modelMode',
    function(modelModeModel) {
      this.modelModeModel = modelModeModel;

      this.gameModelSelectionModel = spyOnService('gameModelSelection');
      this.gameModelSelectionModel.get
        .and.returnValue(['stamp']);

      this.state = { game: { model_selection: 'selection',
                             models: 'models'
                           },
                     factions: 'factions',
                     modes: 'modes',
                     eventP: jasmine.createSpy('eventP')
                   };
    }
  ]));

  context('when user starts charge on model', function() {
    return this.modelModeModel.actions
      .startCharge(this.state);
  }, function() {
    it('should start charge for model', function() {
      expect(this.state.eventP)
        .toHaveBeenCalledWith('Game.command.execute',
                              'onModels',
                              [ 'startChargeP', [], ['stamp'] ]);
    });

    it('should switch to charge mode', function() {
      expect(this.state.eventP)
        .toHaveBeenCalledWith('Modes.switchTo',
                              'ModelCharge');
    });
  });

  context('when user starts place on model', function() {
    return this.modelModeModel.actions
      .startPlace(this.state);
  }, function() {
    it('should start place for model', function() {
      expect(this.state.eventP)
        .toHaveBeenCalledWith('Game.command.execute',
                              'onModels',
                              ['startPlaceP', [], ['stamp']]);
    });

    it('should switch to ModelPlace mode', function() {
      expect(this.state.eventP)
        .toHaveBeenCalledWith('Modes.switchTo',
                              'ModelPlace');
    });
  });
});
