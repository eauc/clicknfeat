describe('stateGameModel', function() {
  beforeEach(inject([
    'stateGame',
    function(stateGameModel) {
      this.stateGameModel = stateGameModel;

      this.gameModel = spyOnService('game');
    }
  ]));

  context('onGameCommandExecute(<cmd>, <args>)', function() {
    return this.stateGameModel
      .onGameCommandExecute(this.state, 'event', 'cmd', 'args');
  }, function() {
    beforeEach(function() {
      this.state = {
        game: 'game',
        queueChangeEventP: jasmine.createSpy('queueChangeEventP')
      };
    });

    it('should execute game command', function() {
      expect(this.gameModel.executeCommandP)
        .toHaveBeenCalledWith('cmd', 'args', this.state, 'game');
      expectGameUpdate(this, 'game.executeCommandP.returnValue');
    });
  });

  function expectGameUpdate(ctxt, game) {
    expect(ctxt.state.game)
      .toBe(game);
    expect(ctxt.state.queueChangeEventP)
      .toHaveBeenCalledWith('Game.change');
  }
});
