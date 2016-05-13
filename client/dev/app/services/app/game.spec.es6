describe('appGame service', function() {
  beforeEach(inject([
    'appGame',
    function(appGameService) {
      this.appGameService = appGameService;

      this.appActionService = spyOnService('appAction');
      this.appGamesService = spyOnService('appGames');
      this.appStateService = spyOnService('appState');
      this.appUserService = spyOnService('appUser');

      this.gameModel = spyOnService('game');
      this.gameConnectionModel = spyOnService('gameConnection');
      this.gamesModel = spyOnService('games');

      this.state = {
        game: 'game',
        local_games: 'local_games',
        user: { state: { name: 'user' } }
      };
    }
  ]));

  context('set(<game>)', function() {
    return this.appGameService
      .set(this.state, 'new_game');
  }, function() {
    it('should set state\'s game', function() {
      expect(this.context.game)
        .toBe('new_game');
    });
  });

  describe('load(<is_online>, <is_private>, <id>)', function() {
    beforeEach(function() {
      this.appGamesService.ready = new self.Promise((resolve) => {
        this.resolveGames = resolve;
      });
      this.appUserService.ready = new self.Promise((resolve) => {
        this.resolveUser = resolve;
      });
    });

    it('should emit "Game.load.dataReady" when data is ready', function() {
      const ret = this.appGameService
        .load(this.state, 'is_online', 'is_private', 'id');

      expect(this.appActionService.do)
        .not.toHaveBeenCalled();

      this.resolveGames();

      expect(this.appActionService.do)
        .not.toHaveBeenCalled();

      this.resolveUser();

      return ret.then(() => {
        expect(this.appActionService.do)
          .toHaveBeenCalledWith('Game.load.dataReady',
                                'is_online', 'is_private', 'id');
      });
    });
  });

  context('loadDataReady(<is_online>, <is_private>, <id>)', function() {
    return this.appGameService
      .loadDataReady(this.state, this.is_online, 'is_private', 'id');
  }, function() {
    context('when <is_online>', function() {
      this.is_online = true;
    }, function() {
      it('should load online game', function() {
        expect(this.gamesModel.loadOnlineGameP)
          .toHaveBeenCalledWith('is_private','id');
        expect(this.appActionService.do)
          .toHaveBeenCalledWith('Game.load.dataLoaded',
                                'games.loadOnlineGameP.returnValue');
      });
    });

    context('when not <is_online>', function() {
      this.is_online = false;
    }, function() {
      it('should load online game', function() {
        expect(this.gamesModel.loadLocalGameP)
          .toHaveBeenCalledWith('id', 'local_games');
        expect(this.appActionService.do)
          .toHaveBeenCalledWith('Game.load.dataLoaded',
                                'games.loadLocalGameP.returnValue');
      });
    });
  });

  context('loadDataLoaded(<data>)', function() {
    return this.appGameService
      .loadDataLoaded(this.state, 'data');
  }, function() {
    beforeEach(function() {
      spyOn(this.appGameService.loading, 'send');
    });

    it('should send loading signal', function() {
      expect(this.appGameService.loading.send)
        .toHaveBeenCalledWith(true);
    });

    it('should load game data', function() {
      expect(this.gameModel.loadP)
        .toHaveBeenCalledWith('data');
      expect(this.appActionService.do)
        .toHaveBeenCalledWith('Game.load.gameLoaded',
                              'game.loadP.returnValue');
    });
  });

  context('loadGameLoaded(<game>)', function() {
    return this.appGameService
      .loadGameLoaded(this.state, 'new_game');
  }, function() {
    beforeEach(function() {
      spyOn(this.appGameService.loading, 'send');
      this.gameModel.isOnline
        .and.returnValue(false);
    });

    it('should send loading signal', function() {
      expect(this.appGameService.loading.send)
        .toHaveBeenCalledWith(false);
    });

    context('when game is online', function() {
      this.gameModel.isOnline
        .and.returnValue(true);
    }, function() {
      it('should open game connection', function() {
        expect(this.gameConnectionModel.openP)
          .toHaveBeenCalledWith('user', 'new_game');
      });
    });

    it('should set state game', function() {
      expect(this.appActionService.do)
        .toHaveBeenCalledWith('Game.set', 'new_game');
    });
  });

  context('onConnectionClose()', function() {
    return this.appGameService
      .connectionClose(this.state);
  }, function() {
    it('should cleanup game connection', function() {
      expect(this.gameConnectionModel.cleanup)
        .toHaveBeenCalledWith('game');
      expect(this.context.game)
        .toBe('gameConnection.cleanup.returnValue');
    });
  });

  xcontext('onInvitePlayer(<cmd>, <args>)', function() {
    return this.appGameService
      .onInvitePlayer(this.state, 'event', 'player');
  }, function() {
    beforeEach(function() {
      this.state.user = { state: { name: 'user' } };
    });

    it('should send chat msg', function() {
      expect(this.appStateService.chainReduce)
        .toHaveBeenCalledWith('User.sendChatMsg', {
          to: [ 'player' ],
          msg: 'User has invited you to join a game',
          link: self.window.location.hash
        });
    });
  });

  xcontext('onCommandExecute(<cmd>, <args>)', function() {
    return this.appGameService
      .onCommandExecute(this.state, 'event', ['cmd', 'args']);
  }, function() {
    it('should execute game command', function() {
      expect(this.gameModel.executeCommandP)
        .toHaveBeenCalledWith('cmd', 'args', 'game');
      expectGameUpdate(this, 'game.executeCommandP.returnValue');
    });
  });

  xcontext('onCommandReplay(<cmd>)', function() {
    return this.appGameService
      .onCommandReplay(this.state, 'event', ['cmd']);
  }, function() {
    it('should replay game command', function() {
      expect(this.gameModel.replayCommandP)
        .toHaveBeenCalledWith('cmd', 'game');
      expectGameUpdate(this, 'game.replayCommandP.returnValue');
    });
  });

  xcontext('onCommandReplayBatch(<cmds>)', function() {
    return this.appGameService
      .onCommandReplayBatch(this.state, 'event', ['cmds']);
  }, function() {
    it('should replay game command', function() {
      expect(this.gameModel.replayCommandsBatchP)
        .toHaveBeenCalledWith('cmds', 'game');
      expectGameUpdate(this, 'game.replayCommandsBatchP.returnValue');
    });
  });

  xcontext('onCommandReplayNext()', function() {
    return this.appGameService
      .onCommandReplayNext(this.state);
  }, function() {
    it('should replay game next command', function() {
      expect(this.gameModel.replayNextCommandP)
        .toHaveBeenCalledWith('game');
      expectGameUpdate(this, 'game.replayNextCommandP.returnValue');
    });
  });

  xcontext('onCommandUndo(<cmd>)', function() {
    return this.appGameService
      .onCommandUndo(this.state, 'event', ['cmd']);
  }, function() {
    it('should undo game command', function() {
      expect(this.gameModel.undoCommandP)
        .toHaveBeenCalledWith('cmd', 'game');
      expectGameUpdate(this, 'game.undoCommandP.returnValue');
    });
  });

  xcontext('onCommandUndoLast()', function() {
    return this.appGameService
      .onCommandUndoLast(this.state);
  }, function() {
    it('should undo last game command', function() {
      expect(this.gameModel.undoLastCommandP)
        .toHaveBeenCalledWith('game');
      expectGameUpdate(this, 'game.undoLastCommandP.returnValue');
    });
  });

  xcontext('onNewChatMsg(<msg>)', function() {
    return this.appGameService
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

  xcontext('onSetCmds(<msg>)', function() {
    return this.appGameService
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

  xcontext('onSetPlayers(<players>)', function() {
    return this.appGameService
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

  function expectGameUpdate(ctxt, game) {
    expect(ctxt.appStateService.reduce)
      .toHaveBeenCalledWith('Game.set', game);
  }
});
