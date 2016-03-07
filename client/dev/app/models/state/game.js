'use strict';

(function () {
  angular.module('clickApp.services').factory('stateGame', stateGameModelFactory);

  stateGameModelFactory.$inject = ['games', 'game', 'gameBoard',
  // 'gameConnection',
  // 'gameFactions',
  // 'gameModels',
  // 'gameModelSelection',
  'gameScenario', 'gameTerrainInfo', 'gameTerrains', 'fileImport', 'stateExports', 'allCommands', 'allTemplates'];
  function stateGameModelFactory(gamesModel, gameModel, gameBoardModel,
  // gameConnectionModel,
  // gameFactionsModel,
  // gameModelsModel,
  // gameModelSelectionModel,
  gameScenarioModel, gameTerrainInfoModel, gameTerrainsModel, fileImportService, stateExportsModel) {
    var stateGameModel = {
      create: stateGamesCreate,
      save: stateGameSave,
      onGameLoad: stateGameOnLoad,
      // onGameConnectionClose: stateGameOnConnectionClose,
      onGameCommandExecute: stateGameOnCommandExecute,
      // onGameCommandUndo: stateGameOnCommandUndo,
      onGameCommandUndoLast: stateGameOnCommandUndoLast,
      // onGameCommandReplay: stateGameOnCommandReplay,
      onGameCommandReplayNext: stateGameOnCommandReplayNext,
      // onGameCommandReplayBatch: stateGameOnCommandReplayBatch,
      // onGameSetCmds: stateGameOnSetCmds,
      // onGameSetPlayers: stateGameOnSetPlayers,
      // onGameNewChatMsg: stateGameOnNewChatMsg,
      onGameUpdate: stateGameOnUpdate,
      // onGameInvitePlayer: stateGameOnInvitePlayer,
      // onGameModelCreate: stateGameOnModelCreate,
      // onGameModelImportList: stateGameOnModelImportList,
      // onGameModelImportFile: stateGameOnModelImportFile,
      onGameTemplateCreate: stateGameOnTemplateCreate,
      onGameTerrainCreate: stateGameOnTerrainCreate,
      onGameTerrainReset: stateGameOnTerrainReset,
      onGameBoardSet: stateGameOnBoardSet,
      onGameBoardSetRandom: stateGameOnBoardSetRandom,
      onGameBoardImportFile: stateGameOnBoardImportFile,
      onGameScenarioSet: stateGameOnScenarioSet,
      onGameScenarioSetRandom: stateGameOnScenarioSetRandom
    };

    // onGameScenarioGenerateObjectives: stateGameOnScenarioGenerateObjectives,
    var setGame$ = R.curry(setGame);
    var exportCurrentGame = stateExportsModel.exportP$('game', R.prop('game'));
    var exportCurrentBoard = stateExportsModel.exportP$('board', exportBoardData);

    R.curryService(stateGameModel);
    return stateGameModel;

    function stateGamesCreate(state) {
      state.game = null;

      state.onEvent('Game.load', stateGameModel.onGameLoad$(state));
      // state.onEvent('Game.connection.close',
      //               stateGameModel.onGameConnectionClose$(state));
      state.onEvent('Game.command.execute', stateGameModel.onGameCommandExecute$(state));
      // state.onEvent('Game.command.undo',
      //               stateGameModel.onGameCommandUndo$(state));
      // state.onEvent('Game.command.replay',
      //               stateGameModel.onGameCommandReplay$(state));
      // state.onEvent('Game.command.replayBatch',
      //               stateGameModel.onGameCommandReplayBatch$(state));
      state.onEvent('Game.command.undoLast', stateGameModel.onGameCommandUndoLast$(state));
      state.onEvent('Game.command.replayNext', stateGameModel.onGameCommandReplayNext$(state));
      // state.onEvent('Game.setCmds',
      //               stateGameModel.onGameSetCmds$(state));
      // state.onEvent('Game.setPlayers',
      //               stateGameModel.onGameSetPlayers$(state));
      // state.onEvent('Game.newChatMsg',
      //               stateGameModel.onGameNewChatMsg$(state));
      state.onEvent('Game.update', stateGameModel.onGameUpdate$(state));
      // state.onEvent('Game.invitePlayer',
      //               stateGameModel.onGameInvitePlayer$(state));
      // state.onEvent('Game.model.create',
      //               stateGameModel.onGameModelCreate$(state));
      // state.onEvent('Game.model.copy',
      //               stateGameModel.onGameModelCopy$(state));
      // state.onEvent('Game.model.importList',
      //               stateGameModel.onGameModelImportList$(state));
      // state.onEvent('Game.model.importFile',
      //               stateGameModel.onGameModelImportFile$(state));
      state.onEvent('Game.template.create', stateGameModel.onGameTemplateCreate$(state));
      state.onEvent('Game.terrain.create', stateGameModel.onGameTerrainCreate$(state));
      state.onEvent('Game.terrain.reset', stateGameModel.onGameTerrainReset$(state));
      state.onEvent('Game.board.set', stateGameModel.onGameBoardSet$(state));
      state.onEvent('Game.board.setRandom', stateGameModel.onGameBoardSetRandom$(state));
      state.onEvent('Game.board.importFile', stateGameModel.onGameBoardImportFile$(state));
      state.onEvent('Game.scenario.set', stateGameModel.onGameScenarioSet$(state));
      state.onEvent('Game.scenario.setRandom', stateGameModel.onGameScenarioSetRandom$(state));
      // state.onEvent('Game.scenario.generateObjectives',
      //               stateGameModel.onGameScenarioGenerateObjectives$(state));

      return state;
    }
    function stateGameSave(state) {
      return R.thread()(function () {
        return saveCurrentGame(state);
      }, function () {
        return exportCurrentGame(state);
      },
      //   R.always(exportCurrentModelSelection(state)),
      function () {
        return exportCurrentBoard(state);
      });
    }
    function stateGameOnLoad(state, event, is_online, is_private, id) {
      return R.threadP(waitForDataReady())(loadStoredGameData, broadcast('Game.loading'), setGame$(state), resetModes, gameModel.loadP$(state),
      // (game) => {
      //   return new self.Promise((resolve, reject) => {
      //     setTimeout(resolve, 3000);
      //   });
      // },
      function (game) {
        state.queueChangeEventP('Game.loaded');
        return game;
      },
      // connectOnlineGame,
      setGame$(state), broadcast('Game.load.success')).catch(onError);

      function waitForDataReady() {
        return self.Promise.all([state.data_ready, state.user_ready, state.games_ready]);
      }
      function loadStoredGameData() {
        return is_online ? gamesModel.loadOnlineGame(is_private, id) : gamesModel.loadLocalGameP(id, state.local_games);
      }
      function broadcast(event) {
        return function (game) {
          state.changeEventP(event);
          return game;
        };
      }
      function resetModes(game) {
        return state.eventP('Modes.reset').then(R.always(game));
      }
      // function connectOnlineGame(game) {
      //   if(!is_online) return game;

      //   return gameConnectionModel
      //     .open$(R.path(['user','state','name'], state), state, game);
      // }
      function onError(error) {
        state.changeEventP('Game.load.error', error);
      }
    }
    // function stateGameOnConnectionClose(state, event) {
    //   event = event;
    //   return R.pipe(
    //     gameConnectionModel.cleanup,
    //     setGame$(state)
    //   )(state.game);
    // }
    function stateGameOnCommandExecute(state, event, cmd, args) {
      return R.threadP(state.game)(gameModel.executeCommandP$(cmd, args, state), setGame$(state)).catch(gameModel.actionError$(state));
    }
    // function stateGameOnCommandUndo(state, event, cmd) {
    //   return R.pipeP(
    //     gameModel.undoCommand$(cmd, state),
    //     setGame$(state)
    //   )(state.game);
    // }
    function stateGameOnCommandUndoLast(state, event) {
      return R.threadP(state.game)(gameModel.undoLastCommandP$(state), setGame$(state)).catch(gameModel.actionError$(state));
    }
    // function stateGameOnCommandReplay(state, event, cmd) {
    //   return R.pipeP(
    //     gameModel.replayCommand$(cmd, state),
    //     setGame$(state)
    //   )(state.game);
    // }
    // function stateGameOnCommandReplayBatch(state, event, cmds) {
    //   return R.pipeP(
    //     gameModel.replayCommandsBatch$(cmds, state),
    //     setGame$(state)
    //   )(state.game);
    // }
    function stateGameOnCommandReplayNext(state, event) {
      return R.threadP(state.game)(gameModel.replayNextCommandP$(state), setGame$(state)).catch(gameModel.actionError$(state));
    }
    // function stateGameOnSetCmds(state, event, set) {
    //   return R.pipe(
    //     R.assoc(set.where, set.cmds),
    //     setGame$(state)
    //   )(state.game);
    // }
    // function stateGameOnSetPlayers(state, event, players) {
    //   return R.pipe(
    //     R.assoc('players', players),
    //     setGame$(state)
    //   )(state.game);
    // }
    // function stateGameOnNewChatMsg(state, event, msg) {
    //   return R.pipe(
    //     R.over(R.lensProp('chat'),
    //            R.compose(R.append(msg.chat), R.defaultTo([]))),
    //     setGame$(state),
    //     () => { state.changeEvent('Game.chat'); }
    //   )(state.game);
    // }
    function stateGameOnUpdate(state, event, lens, update) {
      return R.thread(state.game)(R.over(lens, update), setGame$(state));
    }
    // function stateGameOnInvitePlayer(state, event, to) {
    //   var msg = [
    //     s.capitalize(R.pathOr('Unknown', ['user','state','name'], state)),
    //     'has invited you to join a game'
    //   ].join(' ');
    //   var link = $window.location.hash;
    //   console.log('Invite player', to, msg, link);

    //   return state.event('User.sendChatMsg',
    //                      { to: to, msg: msg, link: link });
    // }
    // function stateGameOnModelCreate(state, event, model_path, repeat = 1) {
    //   state.create = R.assoc('model', {
    //     base: { x: 240, y: 240, r: 0 },
    //     models: R.times((i) => {
    //       return {
    //         info: model_path,
    //         x: 20*i, y: 0, r: 0
    //       };
    //     }, repeat)
    //   }, R.defaultTo({}, state.create));
    //   return state.event('Modes.switchTo', 'CreateModel');
    // }
    // function stateGameOnModelCopy(state, event, create) {
    //   state.create = R.assoc('model', create, state.create);
    //   return state.event('Modes.switchTo', 'CreateModel');
    // }
    // function stateGameOnModelImportList(state, event, list) {
    //   let user = R.pathOr('Unknown', ['user','state','name'], state);
    //   state.create = R.assoc(
    //     'model',
    //     gameFactionsModel
    //       .buildModelsList(list, user, state.factions.references),
    //     state.create
    //   );
    //   console.info('doImportList', list, state.create.model);
    //   return state.event('Modes.switchTo', 'CreateModel');
    // }
    // function stateGameOnModelImportFile(state, event, file) {
    //   return R.pipeP(
    //     fileImportModel.read$('json'),
    //     (create) => {
    //       state.create = R.assoc('model', create, state.create);
    //       return state.event('Modes.switchTo', 'CreateModel');
    //     }
    //   )(file).catch(gameActionError$(state));
    // }
    function stateGameOnTemplateCreate(state, event, type) {
      state.create = {
        base: { x: 240, y: 240, r: 0 },
        templates: [{ type: type, x: 0, y: 0, r: 0 }]
      };
      return state.eventP('Modes.switchTo', 'CreateTemplate');
    }
    function stateGameOnTerrainCreate(state, event, path) {
      state.create = {
        base: { x: 240, y: 240, r: 0 },
        terrains: [{
          info: path,
          x: 0, y: 0, r: 0
        }]
      };
      return state.eventP('Modes.switchTo', 'CreateTerrain');
    }
    function stateGameOnTerrainReset(state, event) {
      return R.threadP(state.game)(R.prop('terrains'), gameTerrainsModel.all, R.pluck('state'), R.pluck('stamp'), function (stamps) {
        return state.eventP('Game.command.execute', 'deleteTerrain', [stamps]);
      }).catch(gameModel.actionError$(state));
    }
    function stateGameOnBoardSet(state, event, name) {
      var board = gameBoardModel.forName(name, state.boards);
      return state.eventP('Game.command.execute', 'setBoard', [board]);
    }
    function stateGameOnBoardSetRandom(state, event) {
      var board = undefined,
          name = gameBoardModel.name(state.game.board);
      while (name === gameBoardModel.name(state.game.board)) {
        board = state.boards[R.randomRange(0, state.boards.length - 1)];
        name = gameBoardModel.name(board);
      }
      return state.eventP('Game.command.execute', 'setBoard', [board]);
    }
    function stateGameOnBoardImportFile(state, event, file) {
      return R.threadP(file)(fileImportService.readP$('json'), function (data) {
        return R.threadP(data)(R.prop('board'), R.rejectIf(R.isNil, 'No board'), function () {
          return state.eventP('Game.command.execute', 'setBoard', [data.board]);
        }, R.always(data), R.path(['terrain', 'terrains']), R.rejectIf(R.isEmpty, 'No terrain'), function () {
          return state.eventP('Game.terrain.reset');
        }, function () {
          return state.eventP('Game.command.execute', 'createTerrain', [data.terrain, false]);
        });
      }).catch(R.spyAndDiscardError('Import board file'));
    }
    function stateGameOnScenarioSet(state, event, name, group) {
      var scenario = gameScenarioModel.forName(name, group);
      return state.eventP('Game.command.execute', 'setScenario', [scenario]);
    }
    function stateGameOnScenarioSetRandom(state, event) {
      var group = gameScenarioModel.group('SR15', state.scenarios);
      var scenario = undefined,
          name = gameScenarioModel.name(state.game.scenario);
      while (name === gameScenarioModel.name(state.game.scenario)) {
        scenario = group[1][R.randomRange(0, group[1].length - 1)];
        name = gameScenarioModel.name(scenario);
      }
      return state.eventP('Game.command.execute', 'setScenario', [scenario]);
    }
    // function stateGameOnScenarioGenerateObjectives(state, event) {
    //   event = event;
    //   return R.pipePromise(
    //     () => {
    //       return gameModelsModel.all(state.game.models);
    //     },
    //     R.filter(R.pipe(
    //       R.path(['state','info']),
    //       R.head,
    //       R.equals('scenario')
    //     )),
    //     R.map(R.path(['state','stamp'])),
    //     (stamps) => {
    //       return state.event('Game.command.execute',
    //                          'deleteModel', [stamps]);
    //     },
    //     () => {
    //       return gameScenarioModel
    //         .createObjectives(state.game.scenario);
    //     },
    //     (objectives) => {
    //       var is_flipped = R.path(['ui_state','flip_map'], state);
    //       return state.event('Game.command.execute',
    //                          'createModel', [objectives, is_flipped]);
    //     }
    //   )();
    // }
    function setGame(state, game) {
      state.game = game;
      console.log('stateGame', state.game);
      state.queueChangeEventP('Game.change');
      return game;
    }
    function saveCurrentGame(state) {
      if (state._game === state.game) return null;
      state._game = state.game;

      if (R.isNil(R.path(['game', 'local_stamp'], state))) {
        return null;
      }
      return R.thread(state.local_games)(gamesModel.updateLocalGame$(state.game), function (games) {
        state.local_games = games;
        console.log('stateSetLocalGames', state.local_games);
        state.queueChangeEventP('Games.local.change');
      });
    }
    // function exportCurrentModelSelection(state) {
    //   return stateExportsModel
    //     .export('models', R.pipePromise(
    //       R.path(['game','model_selection']),
    //       stateExportsModel.rejectIf$(R.isNil),
    //       gameModelSelectionModel.get$('local'),
    //       stateExportsModel.rejectIf$(R.isEmpty),
    //       (stamps) => {
    //         return gameModelsModel
    //           .copyStamps(stamps, R.path(['game', 'models'], state));
    //       },
    //       stateExportsModel.rejectIf$(R.isEmpty)
    //     ), state);
    // }
    function exportBoardData(state) {
      return R.thread(state)(R.prop('game'), function (game) {
        return {
          board: game.board,
          terrain: {
            base: { x: 0, y: 0, r: 0 },
            terrains: R.thread(game.terrains)(gameTerrainsModel.all, R.pluck('state'), R.map(R.pick(['x', 'y', 'r', 'info', 'lk'])))
          }
        };
      });
    }
  }
})();
//# sourceMappingURL=game.js.map
