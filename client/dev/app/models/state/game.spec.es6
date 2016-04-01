describe('stateGame model', function() {
  beforeEach(inject([
    'stateGame',
    function(stateGameModel) {
      this.stateGameModel = stateGameModel;

      this.gameModel = spyOnService('game');
      this.appStateService = spyOnService('appState');

      this.state = {
        game: 'game'
      };
    }
  ]));

  xcontext('onInvitePlayer(<cmd>, <args>)', function() {
    return this.stateGameModel
      .onGameInvitePlayer(this.state, 'event', 'player');
  }, function() {
    beforeEach(function() {
      this.state.user = { state: { name: 'user' } };
    });

    it('should send chat msg', function() {
      expect(this.state.eventP)
        .toHaveBeenCalledWith('User.sendChatMsg', {
          to: [ 'player' ],
          msg: 'User has invited you to join a game',
          link: self.window.location.hash
        });
    });
  });

  context('onCommandExecute(<cmd>, <args>)', function() {
    return this.stateGameModel
      .onCommandExecute(this.state, 'event', ['cmd', 'args']);
  }, function() {
    it('should execute game command', function() {
      expect(this.gameModel.executeCommandP)
        .toHaveBeenCalledWith('cmd', 'args', 'game');
      expectGameUpdate(this, 'game.executeCommandP.returnValue');
    });
  });

  context('onCommandReplay(<cmd>)', function() {
    return this.stateGameModel
      .onCommandReplay(this.state, 'event', ['cmd']);
  }, function() {
    it('should replay game command', function() {
      expect(this.gameModel.replayCommandP)
        .toHaveBeenCalledWith('cmd', 'game');
      expectGameUpdate(this, 'game.replayCommandP.returnValue');
    });
  });

  context('onCommandReplayBatch(<cmds>)', function() {
    return this.stateGameModel
      .onCommandReplayBatch(this.state, 'event', ['cmds']);
  }, function() {
    it('should replay game command', function() {
      expect(this.gameModel.replayCommandsBatchP)
        .toHaveBeenCalledWith('cmds', 'game');
      expectGameUpdate(this, 'game.replayCommandsBatchP.returnValue');
    });
  });

  context('onCommandReplayNext()', function() {
    return this.stateGameModel
      .onCommandReplayNext(this.state);
  }, function() {
    it('should replay game next command', function() {
      expect(this.gameModel.replayNextCommandP)
        .toHaveBeenCalledWith('game');
      expectGameUpdate(this, 'game.replayNextCommandP.returnValue');
    });
  });

  context('onCommandUndo(<cmd>)', function() {
    return this.stateGameModel
      .onCommandUndo(this.state, 'event', ['cmd']);
  }, function() {
    it('should undo game command', function() {
      expect(this.gameModel.undoCommandP)
        .toHaveBeenCalledWith('cmd', 'game');
      expectGameUpdate(this, 'game.undoCommandP.returnValue');
    });
  });

  context('onCommandUndoLast()', function() {
    return this.stateGameModel
      .onCommandUndoLast(this.state);
  }, function() {
    it('should undo last game command', function() {
      expect(this.gameModel.undoLastCommandP)
        .toHaveBeenCalledWith('game');
      expectGameUpdate(this, 'game.undoLastCommandP.returnValue');
    });
  });

  context('onNewChatMsg(<msg>)', function() {
    return this.stateGameModel
      .onNewChatMsg(this.state, 'event', [{ chat: 'chat' }]);
  }, function() {
    beforeEach(function() {
      this.state.game = {};
    });

    it('should append <msg> to game chat', function() {
      expect(this.context.game.chat)
        .toEqual(['chat']);
    });
  });

  context('onSetCmds(<msg>)', function() {
    return this.stateGameModel
      .onSetCmds(this.state, 'event', [{
        where: 'where',
        cmds: 'cmds'
      }]);
  }, function() {
    beforeEach(function() {
      this.state.game = {};
    });

    it('should set game.<msg.where> to <msg.cmds>', function() {
      expect(this.context.game.where)
        .toEqual('cmds');
    });
  });

  context('onSetPlayers(<players>)', function() {
    return this.stateGameModel
      .onSetPlayers(this.state, 'event', ['players']);
  }, function() {
    beforeEach(function() {
      this.state.game = {};
    });

    it('should set game.players to <players>', function() {
      expect(this.context.game.players)
        .toEqual('players');
    });
  });

  context('onConnectionClose()', function() {
    return this.stateGameModel
      .onConnectionClose(this.state);
  }, function() {
    beforeEach(function() {
      this.state.game = {};
      this.gameConnectionModel = spyOnService('gameConnection');
    });

    it('should cleanup game connection', function() {
      expect(this.context.game)
        .toBe('gameConnection.cleanup.returnValue');
    });
  });

  function expectGameUpdate(ctxt, game) {
    expect(ctxt.appStateService.reduce)
      .toHaveBeenCalledWith('Game.set', game);
  }
});
