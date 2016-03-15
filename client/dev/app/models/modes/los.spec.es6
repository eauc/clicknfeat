describe('losMode model', function() {
  beforeEach(inject([ 'losMode', function(losMode) {
    this.losModeService = losMode;

    this.gameLosService = spyOnService('gameLos');
    this.gameModelsService = spyOnService('gameModels');
    this.gameModelSelectionService = spyOnService('gameModelSelection');

    this.game = { los: 'los',
                  models: 'models',
                  model_selection: 'selection'
                };
    this.state = { game: this.game,
                   queueChangeEventP: jasmine.createSpy('queueChangeEventP'),
                   eventP: jasmine.createSpy('eventP')
                 };
    this.state.eventP.and.callFake((e, l, u) => {
      if('Game.update' === e) {
        this.state.game = R.over(l, u, this.state.game);
      }
      return 'state.event.returnValue';
    });
  }]));

  context('when user sets los origin', function() {
    return this.losModeService.actions
      .setOriginModel(this.state, this.event);
  }, function() {
    beforeEach(function() {
      this.target = { state: { stamp: 'stamp' } };
      this.event = { 'click#': { target: this.target } };
    });

    it('should set los origin model', function() {
      expect(this.state.eventP)
        .toHaveBeenCalledWith('Game.command.execute',
                              'setLos', [
                                'setOrigin',
                                [this.target]
                              ]);
    });
  });

  context('when user sets los target', function() {
    return this.losModeService.actions
      .setTargetModel(this.state, this.event);
  }, function() {
    beforeEach(function() {
      this.target = { state: { stamp: 'stamp' } };
      this.event = { 'click#': { target: this.target } };
    });

    it('should set los target model', function() {
      expect(this.state.eventP)
        .toHaveBeenCalledWith('Game.command.execute',
                              'setLos', [
                                'setTarget',
                                [this.target]
                              ]);
    });
  });

  context('when user toggles ignore model', function() {
    return this.losModeService.actions
      .toggleIgnoreModel(this.state, this.event);
  }, function() {
    beforeEach(function() {
      this.target = { state: { stamp: 'stamp' } };
      this.event = { 'click#': { target: this.target } };
    });

    it('should toggle ignore model', function() {
      expect(this.state.eventP)
        .toHaveBeenCalledWith('Game.command.execute',
                              'setLos', [
                                'toggleIgnoreModel',
                                [this.target]
                              ]);
    });
  });
});
