describe('modelMode model', function() {
  beforeEach(inject([
    'modelMode',
    function(modelModeModel) {
      this.modelModeModel = modelModeModel;

      this.appActionService = spyOnService('appAction');
      this.appStateService = spyOnService('appState');
      this.gameModelSelectionModel = spyOnService('gameModelSelection');
      this.gameModelSelectionModel.get
        .and.returnValue(['stamp']);

      this.state = { game: { model_selection: 'selection' } };
    }
  ]));

  context('when user starts charge on model', function() {
    return this.modelModeModel.actions
      .startCharge(this.state);
  }, function() {
    it('should start charge for model', function() {
      expect(this.appActionService.defer)
        .toHaveBeenCalledWith('Game.command.execute',
                              'onModels',
                              [ 'startChargeP', [], ['stamp'] ]);
    });

    it('should switch to charge mode', function() {
      expect(this.appStateService.onAction)
        .toHaveBeenCalledWith(this.state, [ 'Modes.switchTo',
                                            'ModelCharge' ]);
    });
  });

  context('when user starts place on model', function() {
    return this.modelModeModel.actions
      .startPlace(this.state);
  }, function() {
    it('should start place for model', function() {
      expect(this.appActionService.defer)
        .toHaveBeenCalledWith('Game.command.execute',
                              'onModels',
                              ['startPlaceP', [], ['stamp']]);
    });

    it('should switch to ModelPlace mode', function() {
      expect(this.appStateService.onAction)
        .toHaveBeenCalledWith(this.state, [ 'Modes.switchTo',
                                            'ModelPlace' ]);
    });
  });
});
