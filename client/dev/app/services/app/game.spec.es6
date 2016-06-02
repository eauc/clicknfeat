describe('appGame service', function() {
  beforeEach(inject([
    'appGame',
    function(appGameService) {
      this.appGameService = appGameService;

      this.appActionService = spyOnService('appAction');
      this.appDataService = spyOnService('appData');
      this.appErrorService = spyOnService('appError');
      this.appGamesService = spyOnService('appGames');
      this.appGamesService.localUpdate
        .and.callFake(R.nthArg(0));
      this.appModesService = spyOnService('appModes');
      this.appStateService = spyOnService('appState');
      this.appStateService.onAction
        .and.callFake(R.nthArg(0));
      this.appUserService = spyOnService('appUser');
      this.fileExportService = spyOnService('fileExport');
      this.fileImportService = spyOnService('fileImport');

      this.gameModel = spyOnService('game');
      this.gameBoardModel = spyOnService('gameBoard');
      this.gameFactionsModel = spyOnService('gameFactions');
      this.gameScenarioModel = spyOnService('gameScenario');
      this.gameConnectionModel = spyOnService('gameConnection');
      this.gamesModel = spyOnService('games');
      this.gameModelSelectionModel = spyOnService('gameModelSelection');
      this.gameModelsModel = spyOnService('gameModels');
      this.gameTemplatesModel = spyOnService('gameTemplates');
      this.gameTerrainsModel = spyOnService('gameTerrains');

      this.state = {
        boards: 'boards',
        factions: 'factions',
        terrains: 'terrains_info',
        game: { local_stamp: 'game',
                board: 'board',
                models: 'models',
                model_selection: 'model_selection',
                templates: 'templates',
                terrains: 'terrains' },
        local_games: 'local_games',
        user: { state: { name: 'user' } }
      };
    }
  ]));

  context('exportCurrent(<previous>, <game>)', function() {
    return this.appGameService
      .exportCurrent({ url: 'previous_url' }, 'game');
  }, function() {
    it('should cleanup previous url', function() {
      expect(this.fileExportService.cleanup)
        .toHaveBeenCalledWith('previous_url');
    });

    it('should return export object', function() {
      expect(this.fileExportService.generate)
        .toHaveBeenCalledWith('json','game');
      expect(this.context)
        .toEqual({ name: 'clicknfeat_game.json',
                   url: 'fileExport.generate.returnValue'
                 });
    });
  });

  context('saveCurrent()', function() {
    return this.appGameService
      .saveCurrent(this.state);
  }, function() {
    context('when current game has a local stamp', function() {
      this.state.game.local_stamp = 'stamp';
    }, function() {
      it('should update local games', function() {
        expect(this.appGamesService.localUpdate)
          .toHaveBeenCalledWith(this.state, this.state.game);
        expect(this.context)
          .toEqual(this.state);
      });
    });

    context('when current game does not have a local stamp', function() {
      this.state.game.local_stamp = null;
    }, function() {
      it('should not update local games', function() {
        expect(this.appGamesService.localUpdate)
          .not.toHaveBeenCalled();
        expect(this.context)
          .toBe(this.state);
      });
    });
  });

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

  context('load(<is_online>, <is_private>, <id>)', function() {
    return this.appGameService
      .load(this.state, 'is_online', 'is_private', 'id');
  }, function() {
    beforeEach(function() {
      this.appDataService.ready = new self.Promise((resolve) => {
        this.resolveData = resolve;
      });
      this.appGamesService.ready = new self.Promise((resolve) => {
        this.resolveGames = resolve;
      });
      this.appUserService.ready = new self.Promise((resolve) => {
        this.resolveUser = resolve;
      });
    });

    it('should emit "Game.load.dataReady" when data is ready', function() {
      expect(this.appActionService.do)
        .not.toHaveBeenCalled();

      this.resolveData();

      expect(this.appActionService.do)
        .not.toHaveBeenCalled();

      this.resolveGames();

      expect(this.appActionService.do)
        .not.toHaveBeenCalled();

      this.resolveUser();

      return new self.Promise((resolve) => {
        self.setTimeout(() => {
          expect(this.appActionService.do)
            .toHaveBeenCalledWith('Game.load.dataReady',
                                  'is_online', 'is_private', 'id');
          resolve();
        }, 200);
      });
    });

    it('should reset game', function() {
      expect(this.gameModel.close)
        .toHaveBeenCalledWith(this.state.game);
      expect(this.context.game)
        .toEqual('game.close.returnValue');
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

  context('connectionBatchCmd(<msg>)', function() {
    return this.appGameService
      .connectionBatchCmd(this.state, { cmds: 'cmds' });
  }, function() {
    it('should replay game command', function() {
      expect(this.gameModel.replayCommandsBatchP)
        .toHaveBeenCalledWith('cmds', this.state.game);
    });

    expectGameUpdate('game.replayCommandsBatchP.returnValue');

    context('when command fails', function() {
      this.gameModel.replayCommandsBatchP
        .rejectWith('reason');
    }, function() {
      expectGameError();
    });
  });

  context('connectionChat(<msg>)', function() {
    return this.appGameService
      .connectionChat(this.state, { chat: 'chat' });
  }, function() {
    it('should append <msg> to game chat', function() {
      expect(this.context.game.chat)
        .toEqual(['chat']);
    });
  });

  context('connectionReplayCmd(<msg>)', function() {
    return this.appGameService
      .connectionReplayCmd(this.state, { cmd: 'cmd' });
  }, function() {
    it('should replay cmd', function() {
      expect(this.appStateService.onAction)
        .toHaveBeenCalledWith(this.state, ['Game.command.replay','cmd']);
    });
  });

  context('connectionUndoCmd(<msg>)', function() {
    return this.appGameService
      .connectionUndoCmd(this.state, { cmd: 'cmd' });
  }, function() {
    it('should undo cmd', function() {
      expect(this.appStateService.onAction)
        .toHaveBeenCalledWith(this.state, ['Game.command.undo','cmd']);
    });
  });

  context('connectionSendChat(<msg>)', function() {
    return this.appGameService
      .connectionSendChat(this.state, 'msg');
  }, function() {
    it('should send game chat', function() {
      expect(this.gameModel.sendChat)
        .toHaveBeenCalledWith('user', 'msg', this.state.game);
      expect(this.context.game)
        .toBe('game.sendChat.returnValue');
    });
  });

  context('connectionSetCmds(<msg>)', function() {
    return this.appGameService
      .connectionSetCmds(this.state, {
        where: 'where',
        cmds: 'cmds'
      });
  }, function() {
    it('should set game.<msg.where> to <msg.cmds>', function() {
      expect(this.context.game.where)
        .toEqual('cmds');
    });
  });

  context('connectionSetPlayers(<players>)', function() {
    return this.appGameService
      .connectionSetPlayers(this.state, { players: 'players' });
  }, function() {
    it('should set game.players to <players>', function() {
      expect(this.context.game.players)
        .toEqual('players');
    });
  });

  context('invitePlayer(<player>)', function() {
    return this.appGameService
      .invitePlayer(this.state, 'player');
  }, function() {
    beforeEach(function() {
      this.state.user = { state: { name: 'user' } };
    });

    it('should send chat msg', function() {
      expect(this.appStateService.onAction)
        .toHaveBeenCalledWith(this.state, [
          'User.sendChat', {
            to: [ 'player' ],
            msg: 'User has invited you to join a game',
            link: self.window.location.hash
          }
        ]);
    });
  });

  context('connectionClose()', function() {
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

  context('commandExecute(<cmd>, <args>)', function() {
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

  context('commandReplay(<cmd>)', function() {
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

  context('commandReplayNext()', function() {
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

  context('commandUndo(<cmd>)', function() {
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

  context('commandUndoLast()', function() {
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

  example(function(e) {
    const action = `view${s.capitalize(e.action)}`;
    context(`${action}()`, function() {
      return this.appGameService[action](this.state);
    }, function() {
      beforeEach(function() {
        this.listener = jasmine.createSpy('listener');
        this.appGameService.view[e.signal]
          .listen(this.listener);
      });
      it(`should emit "view.${e.signal}" signal`, function() {
        expect(this.listener)
          .toHaveBeenCalled();
      });
    });
  }, [
    [ 'action'      , 'signal'       ],
    [ 'scrollLeft'  , 'scroll_left'  ],
    [ 'scrollRight' , 'scroll_right' ],
    [ 'scrollUp'    , 'scroll_up'    ],
    [ 'scrollDown'  , 'scroll_down'  ],
    [ 'zoomIn'      , 'zoom_in'      ],
    [ 'zoomOut'     , 'zoom_out'     ],
    [ 'zoomReset'   , 'zoom_reset'   ],
    [ 'toggleMenu'  , 'toggle_menu'  ],
  ]);

  context('viewMoveMap(<set>)', function() {
    return this.appGameService
      .viewMoveMap(this.state, 'set');
  }, function() {
    it('should set view.move_map', function(){
      expect(this.context.view.move_map)
        .toBe('set');
    });
  });

  describe('viewFlipMap()', function() {
    it('should toggle view.flip_map', function() {
      this.state = this.appGameService
        .viewFlipMap(this.state);
      expect(this.state.view.flip_map)
        .toBe(true);

      this.state = this.appGameService
        .viewFlipMap(this.state);
      expect(this.state.view.flip_map)
        .toBe(false);
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
    });
  });

  context('boardImportFile(<file>)', function() {
    return this.appGameService
      .boardImportFile(this.state, 'file');
  }, function() {
    it('should import file data', function() {
      expect(this.fileImportService.readP)
        .toHaveBeenCalledWith('json', 'file');
    });

    it('should execute setBoardData command', function() {
      expect(this.appActionService.do)
        .toHaveBeenCalledWith('Game.command.execute',
                              'setBoardData',
                              [ 'fileImport.readP.returnValue' ]);
    });
  });

  context('boardExport(<previous>, <game>)', function() {
    return this.appGameService
      .boardExport({ url: 'previous_url' }, this.state.game);
  }, function() {
    it('should export board & terrain data', function() {
      expect(this.gameTerrainsModel.copyAll)
        .toHaveBeenCalledWith('terrains');
      expect(this.fileExportService.generate)
        .toHaveBeenCalledWith('json', {
          board: 'board',
          terrain: {
            base: { x: 0, y: 0, r: 0 },
            terrains: 'gameTerrains.copyAll.returnValue'
          }
        });
      expect(this.context)
        .toEqual({ name: 'clicknfeat_board.json',
                   url: 'fileExport.generate.returnValue' });
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
    });
  });

  context('scenarioGenerateObjectives()', function() {
    return this.appGameService
      .scenarioGenerateObjectives(this.state);
  }, function() {
    it('should execute createObjectives command', function() {
      expect(this.appStateService.onAction)
        .toHaveBeenCalledWith(this.state, [
          'Game.command.execute',
          'createObjectives', []
        ]);
    });
  });

  context('modelCreate(<info>, <repeat>)', function() {
    return this.appGameService
      .modelCreate(this.state, 'info', 3);
  }, function() {
    it('should set create description', function(){
      expect(this.context.create)
        .toEqual({ base: { x: 240, y: 240, r: 0 },
                   models: [ { info: 'info', x: 0, y: 0, r: 0 },
                             { info: 'info', x: 20, y: 0, r: 0 },
                             { info: 'info', x: 40, y: 0, r: 0 } ]
                 });
    });

    it('should switch to createModel mode', function(){
      expect(this.appStateService.onAction)
        .toHaveBeenCalledWith(this.context, ['Modes.switchTo',
                                             'CreateModel']);
    });
  });

  context('modelCopy(<create>)', function() {
    return this.appGameService
      .modelCopy(this.state, 'create');
  }, function() {
    it('should set create description', function(){
      expect(this.context.create)
        .toBe('create');
    });

    it('should switch to createModel mode', function(){
      expect(this.appStateService.onAction)
        .toHaveBeenCalledWith(this.context, ['Modes.switchTo',
                                             'CreateModel']);
    });
  });

  context('modelImportList(<list>)', function() {
    return this.appGameService
      .modelImportList(this.state, 'list');
  }, function() {
    it('should set create description', function(){
      expect(this.gameFactionsModel.buildModelsList)
        .toHaveBeenCalledWith('list', 'user', 'factions');
      expect(this.context.create)
        .toBe('gameFactions.buildModelsList.returnValue');
    });

    it('should switch to createModel mode', function(){
      expect(this.appStateService.onAction)
        .toHaveBeenCalledWith(this.context, ['Modes.switchTo',
                                             'CreateModel']);
    });
  });

  context('modelImportFile(<file>)', function() {
    return this.appGameService
      .modelImportFile(this.state, 'file');
  }, function() {
    it('should read file data', function(){
      expect(this.fileImportService.readP)
        .toHaveBeenCalledWith('json', 'file');
    });

    it('should copy model data', function(){
      expect(this.appActionService.do)
        .toHaveBeenCalledWith('Game.model.copy',
                              'fileImport.readP.returnValue');
    });
  });

  context('modelSelectionExport(<previous>, <game>)', function() {
    return this.appGameService
      .modelSelectionExport({ url: 'previous_url' }, this.state.game);
  }, function() {
    it('should cleanup previous url', function() {
      expect(this.fileExportService.cleanup)
        .toHaveBeenCalledWith('previous_url');
    });

    it('should return model selection export object', function() {
      expect(this.gameModelSelectionModel.get)
        .toHaveBeenCalledWith('local', 'model_selection');
      expect(this.gameModelsModel.copyStamps)
        .toHaveBeenCalledWith('gameModelSelection.get.returnValue', 'models');
      expect(this.fileExportService.generate)
        .toHaveBeenCalledWith('json','gameModels.copyStamps.returnValue');
      expect(this.context)
        .toEqual({ name: 'clicknfeat_models.json',
                   url: 'fileExport.generate.returnValue'
                 });
    });
  });

  context('templateCreate(<type>)', function() {
    return this.appGameService
      .templateCreate(this.state, 'type');
  }, function() {
    it('should set create description', function(){
      expect(this.context.create)
        .toEqual({ base: { x: 240, y: 240, r: 0 },
                   templates: [ { type: 'type', x: 0, y: 0, r: 0 } ]
                 });
    });

    it('should switch to createTemplate mode', function(){
      expect(this.appStateService.onAction)
        .toHaveBeenCalledWith(this.context, ['Modes.switchTo',
                                             'CreateTemplate']);
    });
  });

  context('templatesSet(<set>)', function() {
    return this.appGameService
      .templatesSet(this.state, 'set');
  }, function() {
    it('should set game templates', function(){
      expect(this.context.game.templates)
        .toBe('set');
    });
  });

  context('templatesSetDeviationMax(<stamps>, <set>)', function() {
    return this.appGameService
      .templatesSetDeviationMax(this.state, 'stamps', 'max');
  }, function() {
    it('should set <max> deviation on <stamp> templates', function(){
      expect(this.gameTemplatesModel.onStampsP)
        .toHaveBeenCalledWith('setMaxDeviation', ['max'],
                              'stamps', 'templates');
      expect(this.appActionService.do)
        .toHaveBeenCalledWith('Game.templates.set',
                              'gameTemplates.onStampsP.returnValue');
    });
  });

  context('terrainCreate(<info>)', function() {
    return this.appGameService
      .terrainCreate(this.state, 'info');
  }, function() {
    it('should set create description', function(){
      expect(this.context.create)
        .toEqual({ base: { x: 240, y: 240, r: 0 },
                   terrains: [ { info: 'info', x: 0, y: 0, r: 0 } ],
                   infos: 'terrains_info'
                 });
    });

    it('should switch to createTerrain mode', function(){
      expect(this.appStateService.onAction)
        .toHaveBeenCalledWith(this.context, ['Modes.switchTo',
                                             'CreateTerrain']);
    });
  });

  context('terrainsSet(<set>)', function() {
    return this.appGameService
      .terrainsSet(this.state, 'set');
  }, function() {
    it('should set game terrains', function(){
      expect(this.context.game.terrains)
        .toBe('set');
    });
  });

  context('terrainsReset()', function() {
    return this.appGameService
      .terrainsReset(this.state);
  }, function() {
    beforeEach(function() {
      this.gameTerrainsModel.all.and.returnValue([
        { state: { stamp: 'stamp1' } },
        { state: { stamp: 'stamp2' } },
      ]);
    });

    it('should delete all game terrains', function(){
      expect(this.appStateService.onAction)
        .toHaveBeenCalledWith(this.state, [
          'Game.command.execute',
          'deleteTerrain',
          [ [ 'stamp1', 'stamp2' ] ]
        ]);
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
