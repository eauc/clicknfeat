describe('stateGame model', function() {
  beforeEach(inject([
    'stateGame',
    function(stateGameModel) {
      this.stateGameModel = stateGameModel;

      this.gameModel = spyOnService('game');

      this.state = {
        game: 'game',
        eventP: jasmine.createSpy('eventP'),
        queueChangeEventP: jasmine.createSpy('queueChangeEventP')
      };
    }
  ]));

  context('onInvitePlayer(<cmd>, <args>)', function() {
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

  context('onGameCommandReplay(<cmd>)', function() {
    return this.stateGameModel
      .onGameCommandReplay(this.state, 'event', 'cmd');
  }, function() {
    it('should replay game command', function() {
      expect(this.gameModel.replayCommandP)
        .toHaveBeenCalledWith('cmd', this.state, 'game');
      expectGameUpdate(this, 'game.replayCommandP.returnValue');
    });
  });

  context('onGameCommandReplayBatch(<cmds>)', function() {
    return this.stateGameModel
      .onGameCommandReplayBatch(this.state, 'event', 'cmds');
  }, function() {
    it('should replay game command', function() {
      expect(this.gameModel.replayCommandsBatchP)
        .toHaveBeenCalledWith('cmds', this.state, 'game');
      expectGameUpdate(this, 'game.replayCommandsBatchP.returnValue');
    });
  });

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

  context('onGameCommandUndo(<cmd>)', function() {
    return this.stateGameModel
      .onGameCommandUndo(this.state, 'event', 'cmd');
  }, function() {
    it('should undo game command', function() {
      expect(this.gameModel.undoCommandP)
        .toHaveBeenCalledWith('cmd', this.state, 'game');
      expectGameUpdate(this, 'game.undoCommandP.returnValue');
    });
  });

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

  context('onGameNewChatMsg(<msg>)', function() {
    return this.stateGameModel
      .onGameNewChatMsg(this.state, 'event', { chat: 'chat' });
  }, function() {
    beforeEach(function() {
      this.state.game = {};
    });

    it('should append <msg> to game chat', function() {
      expect(this.state.game.chat)
        .toEqual(['chat']);
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.change');
    });
  });

  context('onGameSetCmds(<msg>)', function() {
    return this.stateGameModel
      .onGameSetCmds(this.state, 'event', {
        where: 'where',
        cmds: 'cmds'
      });
  }, function() {
    beforeEach(function() {
      this.state.game = {};
    });

    it('should set game.<msg.where> to <msg.cmds>', function() {

      expect(this.state.game.where)
        .toEqual('cmds');
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.change');
    });
  });

  context('onGameSetPlayers(<players>)', function() {
    return this.stateGameModel
      .onGameSetPlayers(this.state, 'event', 'players');
  }, function() {
    beforeEach(function() {
      this.state.game = {};
    });

    it('should set game.players to <players>', function() {
      expect(this.state.game.players)
        .toEqual('players');
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.players.change');
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.change');
    });
  });

  context('onGameConnectionClose()', function() {
    return this.stateGameModel
      .onGameConnectionClose(this.state);
  }, function() {
    beforeEach(function() {
      this.state.game = {};
      this.gameConnectionModel = spyOnService('gameConnection');
    });

    it('should cleanup game connection', function() {
      expect(this.state.game)
        .toBe('gameConnection.cleanup.returnValue');
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.change');
    });
  });

  function expectGameUpdate(ctxt, game) {
    expect(ctxt.state.game)
      .toBe(game);
    expect(ctxt.state.queueChangeEventP)
      .toHaveBeenCalledWith('Game.change');
  }
});
