describe('stateGameModel', function() {
  beforeEach(inject([
    'stateGame',
    function(stateGameModel) {
      this.stateGameModel = stateGameModel;

      this.gameModel = spyOnService('game');

      this.state = {
        game: 'game',
        queueChangeEventP: jasmine.createSpy('queueChangeEventP')
      };
    }
  ]));

  context('onGameCommandExecute(<cmd>, <args>)', function() {
    return this.stateGameModel
      .onGameCommandExecute(this.state, 'event', 'cmd', 'args');
  }, function() {
    it('should execute game command', function() {
      expect(this.gameModel.executeCommandP)
        .toHaveBeenCalledWith('cmd', 'args', this.state, 'game');
      expectGameUpdate(this, 'game.executeCommandP.returnValue');
    });
  });

  // context('onGameCommandReplay(<cmd>)', function() {
  //   return this.stateGameModel
  //     .onGameCommandReplay(this.state, 'event', 'cmd');
  // }, function() {
  //   it('should replay game command', function() {
  //     expect(this.gameModel.replayCommandP)
  //       .toHaveBeenCalledWith('cmd', this.state, 'game');
  //     expectGameUpdate(this, 'game.replayCommandP.returnValue');
  //   });
  // });

  // context('onGameCommandReplayBatch(<cmds>)', function() {
  //   return this.stateGameModel
  //     .onGameCommandReplayBatch(this.state, 'event', 'cmds');
  // }, function() {
  //   it('should replay game command', function() {
  //     expect(this.gameModel.replayCommandsBatchP)
  //       .toHaveBeenCalledWith('cmds', this.state, 'game');
  //     expectGameUpdate(this, 'game.replayCommandsBatchP.returnValue');
  //   });
  // });

  context('onGameCommandReplayNext()', function() {
    return this.stateGameModel
      .onGameCommandReplayNext(this.state);
  }, function() {
    it('should replay game next command', function() {
      expect(this.gameModel.replayNextCommandP)
        .toHaveBeenCalledWith(this.state, 'game');
      expectGameUpdate(this, 'game.replayNextCommandP.returnValue');
    });
  });

  // context('onGameCommandUndo(<cmd>)', function() {
  //   return this.stateGameModel
  //     .onGameCommandUndoP(this.state, 'event', 'cmd');
  // }, function() {
  //   it('should undo game command', function() {
  //     expect(this.gameModel.undoCommandP)
  //       .toHaveBeenCalledWith('cmd', this.state, 'game');
  //     expectGameUpdate(this, 'game.undoCommandP.returnValue');
  //   });
  // });

  context('onGameCommandUndoLast()', function() {
    return this.stateGameModel
      .onGameCommandUndoLast(this.state, 'event');
  }, function() {
    it('should undo last game command', function() {
      expect(this.gameModel.undoLastCommandP)
        .toHaveBeenCalledWith(this.state, 'game');
      expectGameUpdate(this, 'game.undoLastCommandP.returnValue');
    });
  });

  function expectGameUpdate(ctxt, game) {
    expect(ctxt.state.game)
      .toBe(game);
    expect(ctxt.state.queueChangeEventP)
      .toHaveBeenCalledWith('Game.change');
  }
});
