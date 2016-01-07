'use strict';

angular.module('clickApp.services').factory('stateGame', ['$window', 'games', 'game', 'gameBoard', 'gameConnection', 'gameFactions', 'gameModels', 'gameModelSelection', 'gameScenario', 'gameTerrains', 'fileImport', 'stateExports', 'allCommands', 'allTemplates', function stateGamesServiceFactory($window, gamesService, gameService, gameBoardService, gameConnectionService, gameFactionsService, gameModelsService, gameModelSelectionService, gameScenarioService, gameTerrainsService, fileImportService, stateExportsService) {
  var stateGameService = {
    init: function stateGamesInit(state) {
      state.game = null;

      state.onEvent('Game.load', stateGameService.onGameLoad$(state));
      state.onEvent('Game.connection.close', stateGameService.onGameConnectionClose$(state));
      state.onEvent('Game.command.execute', stateGameService.onGameCommandExecute$(state));
      state.onEvent('Game.command.undo', stateGameService.onGameCommandUndo$(state));
      state.onEvent('Game.command.replay', stateGameService.onGameCommandReplay$(state));
      state.onEvent('Game.command.replayBatch', stateGameService.onGameCommandReplayBatch$(state));
      state.onEvent('Game.command.undoLast', stateGameService.onGameCommandUndoLast$(state));
      state.onEvent('Game.command.replayNext', stateGameService.onGameCommandReplayNext$(state));
      state.onEvent('Game.setCmds', stateGameService.onGameSetCmds$(state));
      state.onEvent('Game.setPlayers', stateGameService.onGameSetPlayers$(state));
      state.onEvent('Game.newChatMsg', stateGameService.onGameNewChatMsg$(state));
      state.onEvent('Game.update', stateGameService.onGameUpdate$(state));
      state.onEvent('Game.invitePlayer', stateGameService.onGameInvitePlayer$(state));
      state.onEvent('Game.model.create', stateGameService.onGameModelCreate$(state));
      state.onEvent('Game.model.copy', stateGameService.onGameModelCopy$(state));
      state.onEvent('Game.model.importList', stateGameService.onGameModelImportList$(state));
      state.onEvent('Game.model.importFile', stateGameService.onGameModelImportFile$(state));
      state.onEvent('Game.template.create', stateGameService.onGameTemplateCreate$(state));
      state.onEvent('Game.terrain.create', stateGameService.onGameTerrainCreate$(state));
      state.onEvent('Game.terrain.reset', stateGameService.onGameTerrainReset$(state));
      state.onEvent('Game.board.set', stateGameService.onGameBoardSet$(state));
      state.onEvent('Game.board.setRandom', stateGameService.onGameBoardSetRandom$(state));
      state.onEvent('Game.board.importFile', stateGameService.onGameBoardImportFile$(state));
      state.onEvent('Game.scenario.set', stateGameService.onGameScenarioSet$(state));
      state.onEvent('Game.scenario.setRandom', stateGameService.onGameScenarioSetRandom$(state));
      state.onEvent('Game.scenario.generateObjectives', stateGameService.onGameScenarioGenerateObjectives$(state));

      return state;
    },
    save: function stateGameSave(state) {
      return R.pipeP(function () {
        return exportCurrentGame(state);
      }, function () {
        return exportCurrentModelSelection(state);
      }, function () {
        return exportCurrentBoard(state);
      })();
    },
    onGameLoad: function stateGameOnLoad(state, event, is_online, is_private, id) {
      return R.pipePromise(R.always(state.data_ready), R.always(state.user_ready), R.always(state.games_ready), function () {
        if (is_online) {
          return gamesService.loadOnlineGame(is_private, id);
        } else {
          return gamesService.loadLocalGame(id, state.local_games);
        }
      }, function (game) {
        state.changeEventUnbuffered('Game.loading');
        return game;
      }, setGame$(state), function (game) {
        return R.pipeP(function () {
          return state.event('Modes.reset');
        }, R.always(game))();
      }, gameService.load$(state), function (game) {
        state.changeEvent('Game.loaded');
        return game;
      }, function (game) {
        if (!is_online) return game;
        return gameConnectionService.open$(R.path(['user', 'state', 'name'], state), state, game);
      }, function (game) {
        if (is_online) return game;

        return R.assoc('local_id', id, game);
      }, setGame$(state), function () {
        state.changeEvent('Game.load.success');
      })().catch(function (error) {
        state.changeEvent('Game.load.error', error);
      });
    },
    onGameConnectionClose: function stateGameOnConnectionClose(state, event) {
      event = event;
      return R.pipe(gameConnectionService.cleanup, setGame$(state))(state.game);
    },
    onGameCommandExecute: function stateGameOnCommandExecute(state, event, cmd, args) {
      return R.pipeP(gameService.executeCommand$(cmd, args, state), setGame$(state))(state.game).catch(gameActionError$(state));
    },
    onGameCommandUndo: function stateGameOnCommandUndo(state, event, cmd) {
      return R.pipeP(gameService.undoCommand$(cmd, state), setGame$(state))(state.game);
    },
    onGameCommandUndoLast: function stateGameOnCommandUndoLast(state, event) {
      event = event;
      return R.pipeP(gameService.undoLastCommand$(state), setGame$(state))(state.game).catch(gameActionError$(state));
    },
    onGameCommandReplay: function stateGameOnCommandReplay(state, event, cmd) {
      return R.pipeP(gameService.replayCommand$(cmd, state), setGame$(state))(state.game);
    },
    onGameCommandReplayBatch: function stateGameOnCommandReplayBatch(state, event, cmds) {
      return R.pipeP(gameService.replayCommandsBatch$(cmds, state), setGame$(state))(state.game);
    },
    onGameCommandReplayNext: function stateGameOnCommandReplayNext(state, event) {
      event = event;
      return R.pipeP(gameService.replayNextCommand$(state), setGame$(state))(state.game).catch(gameActionError$(state));
    },
    onGameSetCmds: function stateGameOnSetCmds(state, event, set) {
      return R.pipe(R.assoc(set.where, set.cmds), setGame$(state))(state.game);
    },
    onGameSetPlayers: function stateGameOnSetPlayers(state, event, players) {
      return R.pipe(R.assoc('players', players), setGame$(state))(state.game);
    },
    onGameNewChatMsg: function stateGameOnNewChatMsg(state, event, msg) {
      return R.pipe(R.over(R.lensProp('chat'), R.compose(R.append(msg.chat), R.defaultTo([]))), setGame$(state), function () {
        state.changeEvent('Game.chat');
      })(state.game);
    },
    onGameUpdate: function stateGameOnUpdate(state, event, lens, update) {
      return R.pipe(R.over(lens, update), setGame$(state))(state.game);
    },
    onGameInvitePlayer: function stateGameOnInvitePlayer(state, event, to) {
      var msg = [s.capitalize(R.pathOr('Unknown', ['user', 'state', 'name'], state)), 'has invited you to join a game'].join(' ');
      var link = $window.location.hash;
      console.log('Invite player', to, msg, link);

      return state.event('User.sendChatMsg', { to: to, msg: msg, link: link });
    },
    onGameModelCreate: function stateGameOnModelCreate(state, event, model_path) {
      var repeat = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];

      state.create = R.assoc('model', {
        base: { x: 240, y: 240, r: 0 },
        models: R.times(function (i) {
          return {
            info: model_path,
            x: 20 * i, y: 0, r: 0
          };
        }, repeat)
      }, R.defaultTo({}, state.create));
      return state.event('Modes.switchTo', 'CreateModel');
    },
    onGameModelCopy: function stateGameOnModelCopy(state, event, create) {
      state.create = R.assoc('model', create, state.create);
      return state.event('Modes.switchTo', 'CreateModel');
    },
    onGameModelImportList: function stateGameOnModelImportList(state, event, list) {
      var user = R.pathOr('Unknown', ['user', 'state', 'name'], state);
      state.create = R.assoc('model', gameFactionsService.buildModelsList(list, user, state.factions.references), state.create);
      console.info('doImportList', list, state.create.model);
      return state.event('Modes.switchTo', 'CreateModel');
    },
    onGameModelImportFile: function stateGameOnModelImportFile(state, event, file) {
      return R.pipeP(fileImportService.read$('json'), function (create) {
        state.create = R.assoc('model', create, state.create);
        return state.event('Modes.switchTo', 'CreateModel');
      })(file).catch(gameActionError$(state));
    },
    onGameTemplateCreate: function stateGameOnModelCreate(state, event, type) {
      state.create = R.assoc('template', {
        base: { x: 240, y: 240, r: 0 },
        templates: [{ type: type, x: 0, y: 0, r: 0 }]
      }, R.defaultTo({}, state.create));
      return state.event('Modes.switchTo', 'CreateTemplate');
    },
    onGameTerrainCreate: function stateGameOnTerrainCreate(state, event, path) {
      state.create = R.assoc('terrain', {
        base: { x: 240, y: 240, r: 0 },
        terrains: [{
          info: path,
          x: 0, y: 0, r: 0
        }]
      }, R.defaultTo({}, state.create));
      return state.event('Modes.switchTo', 'CreateTerrain');
    },
    onGameTerrainReset: function stateGameOnTerrainReset(state, event) {
      event = event;
      return R.pipePromise(function () {
        return gameTerrainsService.all(state.game.terrains);
      }, R.pluck('state'), R.pluck('stamp'), function (stamps) {
        return state.event('Game.command.execute', 'deleteTerrain', [stamps]);
      })().catch(gameActionError$(state));
    },
    onGameBoardSet: function stateGameOnBoardSet(state, event, name) {
      var board = gameBoardService.forName(name, state.boards);
      return state.event('Game.command.execute', 'setBoard', [board]);
    },
    onGameBoardSetRandom: function stateGameOnBoardSetRandom(state, event) {
      event = event;
      var board = undefined,
          name = gameBoardService.name(state.game.board);
      while (name === gameBoardService.name(state.game.board)) {
        board = state.boards[R.randomRange(0, state.boards.length - 1)];
        name = gameBoardService.name(board);
      }
      return state.event('Game.command.execute', 'setBoard', [board]);
    },
    onGameBoardImportFile: function stateGameOnBoardImportFile(state, event, file) {
      return R.pipeP(fileImportService.read$('json'), function (board_info) {
        return R.pipePromise(function () {
          if (!board_info.board) return self.Promise.reject();

          return state.event('Game.command.execute', 'setBoard', [board_info.board]);
        }, function () {
          if (R.isEmpty(R.pathOr([], ['terrain', 'terrains'], board_info))) {
            return self.Promise.reject();
          }

          return state.event('Game.terrain.reset');
        }, function () {
          return state.event('Game.command.execute', 'createTerrain', [board_info.terrain, false]);
        })();
      })(file).catch(R.always(null));
    },
    onGameScenarioSet: function stateGameOnScenarioSet(state, event, name, group) {
      var scenario = gameScenarioService.forName(name, group);
      return state.event('Game.command.execute', 'setScenario', [scenario]);
    },
    onGameScenarioSetRandom: function stateGameOnScenarioSetRandom(state, event) {
      event = event;
      var group = gameScenarioService.group('SR15', state.scenarios);
      var scenario,
          name = gameScenarioService.name(state.game.scenario);
      while (name === gameScenarioService.name(state.game.scenario)) {
        scenario = group[1][R.randomRange(0, group[1].length - 1)];
        name = gameScenarioService.name(scenario);
      }
      return state.event('Game.command.execute', 'setScenario', [scenario]);
    },
    onGameScenarioGenerateObjectives: function stateGameOnScenarioGenerateObjectives(state, event) {
      event = event;
      return R.pipePromise(function () {
        return gameModelsService.all(state.game.models);
      }, R.filter(R.pipe(R.path(['state', 'info']), R.head, R.equals('scenario'))), R.map(R.path(['state', 'stamp'])), function (stamps) {
        return state.event('Game.command.execute', 'deleteModel', [stamps]);
      }, function () {
        return gameScenarioService.createObjectives(state.game.scenario);
      }, function (objectives) {
        var is_flipped = R.path(['ui_state', 'flip_map'], state);
        return state.event('Game.command.execute', 'createModel', [objectives, is_flipped]);
      })();
    }
  };
  var setGame$ = R.curry(function (state, game) {
    state.game = game;
    console.log('stateGame', state.game);
    state.changeEvent('Game.change');
    return game;
  });
  var gameActionError$ = R.curry(function (state, error) {
    state.changeEvent('Game.action.error', error);
    return null;
    // return self.Promise.reject(error);
  });
  var exportCurrentGame = stateExportsService.export$('game', R.prop('game'));
  function exportCurrentModelSelection(state) {
    return stateExportsService.export('models', R.pipePromise(R.path(['game', 'model_selection']), stateExportsService.rejectIf$(R.isNil), gameModelSelectionService.get$('local'), stateExportsService.rejectIf$(R.isEmpty), function (stamps) {
      return gameModelsService.copyStamps(stamps, R.path(['game', 'models'], state));
    }, stateExportsService.rejectIf$(R.isEmpty)), state);
  }
  var exportCurrentBoard = stateExportsService.export$('board', R.pipePromise(R.prop('game'), stateExportsService.rejectIf$(R.isNil), function (game) {
    return {
      board: game.board,
      terrain: {
        base: { x: 0, y: 0, r: 0 },
        terrains: R.pipe(gameTerrainsService.all, R.pluck('state'), R.map(R.pick(['x', 'y', 'r', 'info', 'lk'])))(game.terrains)
      }
    };
  }));
  R.curryService(stateGameService);
  return stateGameService;
}]);
//# sourceMappingURL=game.js.map
