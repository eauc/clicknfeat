describe('losMode model', function() {
  beforeEach(inject([ 'losMode', function(losMode) {
    this.losModeService = losMode;

    this.appStateService = spyOnService('appState');

    this.state = 'state';
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
      expect(this.appStateService.onAction)
        .toHaveBeenCalledWith(this.state,
                              [ 'Game.command.execute',
                                'setLos', [
                                  'setOrigin',
                                  [this.target]
                                ]
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
      expect(this.appStateService.onAction)
        .toHaveBeenCalledWith(this.state,
                              [ 'Game.command.execute',
                                'setLos', [
                                  'setTarget',
                                  [this.target]
                                ]
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
      expect(this.appStateService.onAction)
        .toHaveBeenCalledWith(this.state,
                              [ 'Game.command.execute',
                                'setLos', [
                                  'toggleIgnoreModel',
                                  [this.target]
                                ]
                              ]);
    });
  });
});
