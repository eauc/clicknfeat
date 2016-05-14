describe('appGame service', function() {
  beforeEach(inject([
    'appGame',
    function(appGameService) {
      this.appGameService = appGameService;

      this.appActionService = spyOnService('appAction');
      this.appErrorService = spyOnService('appError');
      this.appGamesService = spyOnService('appGames');
      this.appGamesService.localUpdate
        .and.callFake(R.nthArg(0));
      this.appModesService = spyOnService('appModes');
      this.appStateService = spyOnService('appState');
      this.appUserService = spyOnService('appUser');

      this.gameModel = spyOnService('game');
      this.gameBoardModel = spyOnService('gameBoard');
      this.gameScenarioModel = spyOnService('gameScenario');
      this.gameConnectionModel = spyOnService('gameConnection');
      this.gamesModel = spyOnService('games');

      this.state = {
        boards: 'boards',
        game: { local_stamp: 'game' },
        local_games: 'local_games',
        user: { state: { name: 'user' } }
      };
    }
  ]));

  context('set(<game>)', function() {
    return this.appGameService
      .set(this.state, this.game);
  }, function() {
    beforeEach(function() {
      this.game = { local_stamp: 'new_game' };
    });

    it('should set state\'s game', function() {
      expect(this.context.game)
        .toEqual(this.game);
    });

    it('should update local games', function() {
      expect(this.appGamesService.localUpdate)
        .toHaveBeenCalledWith(this.context, this.game);
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
      this.appModesService.reset
        .and.callFake(R.assoc('modes', 'reset'));
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

    it('should reset modes', function() {
      expect(this.appModesService.reset)
        .toHaveBeenCalledWith(this.state);
      expect(this.context.modes)
        .toBe('reset');
    });

    it('should update local games', function() {
      expect(this.appGamesService.localUpdate)
        .toHaveBeenCalledWith(this.context, this.context.game);
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
    beforeEach(function() {
      this.gameConnectionModel.cleanup
        .and.returnValue({ local_stamp: 'gameConnection.cleanup.returnValue' });
    });

    it('should cleanup game connection', function() {
      expect(this.gameConnectionModel.cleanup)
        .toHaveBeenCalledWith(this.state.game);
      expect(this.context.game)
        .toEqual({ local_stamp: 'gameConnection.cleanup.returnValue' });
    });

    it('should update local games', function() {
      expect(this.appGamesService.localUpdate)
        .toHaveBeenCalledWith(this.context, {
          local_stamp: 'gameConnection.cleanup.returnValue'
        });
    });
  });

  context('onCommandExecute(<cmd>, <args>)', function() {
    return this.appGameService
      .commandExecute(this.state, 'cmd', 'args');
  }, function() {
    it('should execute game command', function() {
      expect(this.gameModel.executeCommandP)
        .toHaveBeenCalledWith('cmd', 'args', 'user', this.state.game);
    });

    expectGameUpdate('game.executeCommandP.returnValue');

    context('when command fails', function() {
      this.gameModel.executeCommandP
        .rejectWith('reason');
    }, function() {
      expectGameError();
    });
  });

  context('onCommandReplay(<cmd>)', function() {
    return this.appGameService
      .commandReplay(this.state, 'cmd');
  }, function() {
    it('should replay game command', function() {
      expect(this.gameModel.replayCommandP)
        .toHaveBeenCalledWith('cmd', this.state.game);
    });

    expectGameUpdate('game.replayCommandP.returnValue');

    context('when command fails', function() {
      this.gameModel.replayCommandP
        .rejectWith('reason');
    }, function() {
      expectGameError();
    });
  });

  xcontext('onCommandReplayBatch(<cmds>)', function() {
    return this.appGameService
      .commandReplayBatch(this.state, 'cmds');
  }, function() {
    it('should replay game command', function() {
      expect(this.gameModel.replayCommandsBatchP)
        .toHaveBeenCalledWith('cmds', this.state.game);
    });

    expectGameUpdate('game.replayCommandBatchP.returnValue');

    context('when command fails', function() {
      this.gameModel.replayCommandBatchP
        .rejectWith('reason');
    }, function() {
      expectGameError();
    });
  });

  context('onCommandReplayNext()', function() {
    return this.appGameService
      .commandReplayNext(this.state);
  }, function() {
    it('should replay game next command', function() {
      expect(this.gameModel.replayNextCommandP)
        .toHaveBeenCalledWith(this.state.game);
    });

    expectGameUpdate('game.replayNextCommandP.returnValue');

    context('when command fails', function() {
      this.gameModel.replayNextCommandP
        .rejectWith('reason');
    }, function() {
      expectGameError();
    });
  });

  context('onCommandUndo(<cmd>)', function() {
    return this.appGameService
      .commandUndo(this.state, 'cmd');
  }, function() {
    it('should undo game command', function() {
      expect(this.gameModel.undoCommandP)
        .toHaveBeenCalledWith('cmd', this.state.game);
    });

    expectGameUpdate('game.undoCommandP.returnValue');

    context('when command fails', function() {
      this.gameModel.undoCommandP
        .rejectWith('reason');
    }, function() {
      expectGameError();
    });
  });

  context('onCommandUndoLast()', function() {
    return this.appGameService
      .commandUndoLast(this.state);
  }, function() {
    it('should undo last game command', function() {
      expect(this.gameModel.undoLastCommandP)
        .toHaveBeenCalledWith(this.state.game);
    });

    expectGameUpdate('game.undoLastCommandP.returnValue');

    context('when command fails', function() {
      this.gameModel.undoLastCommandP
        .rejectWith('reason');
    }, function() {
      expectGameError();
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

  context('boardSet(<name>)', function() {
    return this.appGameService
      .boardSet(this.state, 'board_name');
  }, function() {
    it('should setBoard on game', function() {
      expect(this.gameBoardModel.forName)
        .toHaveBeenCalledWith('board_name', 'boards');
      expect(this.appStateService.onAction)
        .toHaveBeenCalledWith(this.state, [
          'Game.command.execute',
          'setBoard', [ 'gameBoard.forName.returnValue' ]
        ]);
      expect(this.context)
        .toBe('appState.onAction.returnValue');
    });
  });

  context('scenarioSet(<name>, <group>)', function() {
    return this.appGameService
      .scenarioSet(this.state, 'name', 'group');
  }, function() {
    it('should setScenario on game', function() {
      expect(this.gameScenarioModel.forName)
        .toHaveBeenCalledWith('name', 'group');
      expect(this.appStateService.onAction)
        .toHaveBeenCalledWith(this.state, [
          'Game.command.execute',
          'setScenario', [ 'gameScenario.forName.returnValue' ]
        ]);
      expect(this.context)
        .toBe('appState.onAction.returnValue');
    });
  });

  function expectGameUpdate(game) {
    it('should set state game', function() {
      expect(this.appActionService.do)
        .toHaveBeenCalledWith('Game.set', game);
    });
  }

  function expectGameError() {
    it('should emit error', function() {
      expect(this.appErrorService.emit)
        .toHaveBeenCalledWith('reason');
    });
  }
});
