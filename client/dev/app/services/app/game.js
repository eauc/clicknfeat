'use strict';

(function () {
  angular.module('clickApp.services').factory('appGame', stateGameModelFactory);

  stateGameModelFactory.$inject = ['behaviours', 'appAction', 'appGames', 'appModes', 'appState', 'appUser', 'game', 'gameConnection', 'games'];

  // 'fileExport',
  // 'fileImport',
  // 'appState',
  // 'state',
  // 'modes',
  // 'gameBoard',
  // 'gameFactions',
  // 'gameModels',
  // 'gameModelSelection',
  // 'gameScenario',
  // 'gameTerrains',
  // 'gameTemplates',
  // 'gameTemplateSelection',
  // 'gameTerrainSelection',
  // 'allCommands',
  function stateGameModelFactory(behavioursModel, appActionService, appGamesService, appModesService, appStateService, appUserService, gameModel, gameConnectionModel, gamesModel
  // fileExportService,
  // fileImportService,
  // appStateService,
  // stateModel,
  // modesModel,
  // gameBoardModel,
  // gameFactionsModel,
  // gameModelsModel,
  // gameModelSelectionModel,
  // gameScenarioModel,
  // gameTerrainsModel,
  // gameTemplatesModel,
  // gameTemplateSelectionModel,
  // gameTerrainSelectionModel
  ) {
    var GAME_LENS = R.lensProp('game');
    var USER_NAME_LENS = R.lensPath(['user', 'state', 'name']);

    var game = appStateService.state.map(R.viewOr({}, GAME_LENS));
    var loading = behavioursModel.signalModel.create();
    var view = behavioursModel.signalModel.create();

    var appGameService = {
      game: game, loading: loading, view: view,
      set: actionGameSet,
      load: actionGameLoad,
      loadDataReady: actionGameLoadDataReady,
      loadDataLoaded: actionGameLoadDataLoaded,
      loadGameLoaded: actionGameLoadGameLoaded,
      connectionClose: actionGameConnectionClose
    };
    // onCommandExecute: stateGameOnCommandExecute,
    // onCommandUndo: stateGameOnCommandUndo,
    // onCommandUndoLast: stateGameOnCommandUndoLast,
    // onCommandReplay: stateGameOnCommandReplay,
    // onCommandReplayNext: stateGameOnCommandReplayNext,
    // onCommandReplayBatch: stateGameOnCommandReplayBatch,
    // onSetCmds: stateGameOnSetCmds,
    // onSetPlayers: stateGameOnSetPlayers,
    // onNewChatMsg: stateGameOnNewChatMsg,
    // onUiStateFlip: stateGameOnUiStateFlip,
    // onInvitePlayer: stateGameOnInvitePlayer,
    // onModelCreate: stateGameOnModelCreate,
    // onModelCopy: stateGameOnModelCopy,
    // onModelImportList: stateGameOnModelImportList,
    // onModelImportFile: stateGameOnModelImportFile,
    // onModelImportFileData: stateGameOnModelImportFileData,
    // onTemplateCreate: stateGameOnTemplateCreate,
    // onTerrainCreate: stateGameOnTerrainCreate,
    // onTerrainReset: stateGameOnTerrainReset,
    // onBoardSet: stateGameOnBoardSet,
    // onBoardSetRandom: stateGameOnBoardSetRandom,
    // onBoardImportFile: stateGameOnBoardImportFile,
    // onScenarioSet: stateGameOnScenarioSet,
    // onScenarioSetRandom: stateGameOnScenarioSetRandom,
    // onScenarioRefresh: stateGameOnScenarioRefresh,
    // onScenarioGenerateObjectives: stateGameOnScenarioGenerateObjectives,
    // updateExport: stateGameUpdateExport,
    // updateBoardExport: stateGameUpdateBoardExport,
    // updateModelsExport: stateGameUpdateModelsExport,
    // saveCurrent: stateGameSaveCurrent,
    // checkMode: stateGameCheckMode,
    // closeOsd: stateGameCloseOsd
    R.curryService(appGameService);

    mount();

    return appGameService;

    function mount() {
      appActionService
      // .register('Game.update'              , actionGameUpdate)
      .register('Game.set', actionGameSet).register('Game.load', actionGameLoad).register('Game.load.dataReady', actionGameLoadDataReady).register('Game.load.dataLoaded', actionGameLoadDataLoaded).register('Game.load.gameLoaded', actionGameLoadGameLoaded).register('Game.connection.close', actionGameConnectionClose)
      // .register('Game.command.execute'     , actionGameCommandExecute)
      // .register('Game.command.undo'        , actionGameCommandUndo)
      // .register('Game.command.replay'      , actionGameCommandReplay)
      // .register('Game.command.replayBatch' , actionGameCommandReplayBatch)
      // .register('Game.command.undoLast'    , actionGameCommandUndoLast)
      // .register('Game.command.replayNext'  , actionGameCommandReplayNext)
      // .register('Game.invitePlayer'        , actionGameInvitePlayer)
      // .register('Game.setCmds'             , actionGameSetCmds)
      // .register('Game.setPlayers'          , actionGameSetPlayers)
      // .register('Game.newChatMsg'          , actionGameNewChatMsg)
      // .register('Game.uiState.flip'        , actionGameUiStateFlip)
      // .register('Game.board.set'           , actionGameBoardSet)
      // .register('Game.board.setRandom'     , actionGameBoardSetRandom)
      // .register('Game.scenario.set'        , actionGameScenarioSet)
      // .register('Game.scenario.setRandom'  , actionGameScenarioSetRandom)
      // .register('Game.scenario.generateObjectives',
      //             actionGameScenarioGenerateObjectives)
      // .register('Game.model.create'        , actionGameModelCreate)
      // .register('Game.model.copy'          , actionGameModelCopy)
      // .register('Game.model.importList'    , actionGameModelImportList)
      // .register('Game.model.importFile'    , actionGameModelImportFile)
      // .register('Game.model.importFileData', actionGameModelImportFileData)
      // .register('Game.template.create'     , actionGameTemplateCreate)
      // .register('Game.terrain.create'      , actionGameTerrainCreate)
      // .register('Game.terrain.reset'       , actionGameTerrainReset)
      // .register('Game.board.importFile'    , actionGameBoardImportFile)
      ;
      // .addListener('Game.change'             , stateGameModel.saveCurrent)
      // .addListener('Modes.change',
      //              stateGameModel.closeOsd)
      // .addListener('Game.template_selection.local.change',
      //              stateGameModel.checkMode)
      // .addListener('Game.terrain_selection.local.change',
      //              stateGameModel.checkMode)
      // .addListener('Game.model_selection.local.change',
      //              stateGameModel.checkMode);
      // .addReducer('Game.scenario.refresh'    , stateGameModel.onScenarioRefresh)

      // const game_export_cell = appStateService
      //         .cell('Game.change',
      //               stateGameModel.updateExport,
      //               {});
      // const board_export_cell = appStateService
      //         .cell([ 'Game.board.change',
      //                 'Game.terrains.change' ],
      //               stateGameModel.updateBoardExport,
      //               {});
      // const models_export_cell = appStateService
      //         .cell([ 'Game.models.change',
      //                 'Game.model_selection.local.change' ],
      //               stateGameModel.updateModelsExport,
      //               {});
      // appStateService
      //   .onChange('Game.change',
      //             'Game.layers.change',
      //             R.pipe(R.defaultTo({}), R.prop('layers')));
      // appStateService
      //   .onChange('AppState.change',
      //             'Modes.change',
      //             R.path(['modes','current','name']));
      // appStateService
      //   .onChange('Game.change',
      //             'Game.command.change',
      //             [ R.prop('commands'),
      //               R.prop('commands_log'),
      //               R.prop('undo'),
      //               R.prop('undo_log')
      //             ]);
      // appStateService
      //   .onChange('AppState.change',
      //             'Game.view.flipMap',
      //             R.pipe(R.view(UI_STATE_LENS), R.prop('flipped')));
      // appStateService
      //   .onChange('Game.change',
      //             'Game.dice.change',
      //             R.prop('dice'));
      // appStateService
      //   .onChange('Game.change',
      //             'Game.board.change',
      //             R.prop('board'));
      // appStateService
      //   .onChange('Game.change',
      //             'Game.scenario.change',
      //             R.prop('scenario'));
      // appStateService
      //   .onChange('AppState.change',
      //             'Create.base.change',
      //             R.path(['create','base']));
      // appStateService
      //   .onChange('Game.change',
      //             'Game.models.change',
      //             R.prop(['models']));
      // appStateService
      //   .onChange('Game.change',
      //             'Game.model_selection.change',
      //             R.prop('model_selection'));
      // appStateService
      //   .onChange('Game.model_selection.change',
      //             'Game.model_selection.local.change',
      //             R.prop('local'));
      // appStateService
      //   .onChange('Game.change',
      //             'Game.templates.change',
      //             R.prop(['templates']));
      // appStateService
      //   .onChange('Game.change',
      //             'Game.template_selection.change',
      //             R.prop('template_selection'));
      // appStateService
      //   .onChange('Game.template_selection.change',
      //             'Game.template_selection.local.change',
      //             R.prop('local'));
      // appStateService
      //   .onChange('Game.change',
      //             'Game.terrains.change',
      //             R.prop(['terrains']));
      // appStateService
      //   .onChange('Game.change',
      //             'Game.terrain_selection.change',
      //             R.prop('terrain_selection'));
      // appStateService
      //   .onChange('Game.terrain_selection.change',
      //             'Game.terrain_selection.local.change',
      //             R.prop('local'));
      // appStateService
      //   .onChange('Game.change',
      //             'Game.ruler.remote.change',
      //             R.path(['ruler','remote']));
      // appStateService
      //   .onChange('Game.change',
      //             'Game.ruler.local.change',
      //             R.path(['ruler','local']));
      // appStateService
      //   .onChange('Game.change',
      //             'Game.los.remote.change',
      //             R.path(['los','remote']));
      // appStateService
      //   .onChange('Game.change',
      //             'Game.los.local.change',
      //             R.path(['los','local']));
    }
    // function stateGameOnUpdate(state, _event_, [fn]) {
    //   return R.over(GAME_LENS, fn, state);
    // }
    function actionGameSet(state, game) {
      return R.set(GAME_LENS, game, state);
    }
    function actionGameLoad(_state_, is_online, is_private, id) {
      return waitForDataReady().then(function () {
        return appActionService.do('Game.load.dataReady', is_online, is_private, id);
      });

      function waitForDataReady() {
        return R.allP([
        // state.data_ready,
        appUserService.ready, appGamesService.ready]);
      }
    }
    function actionGameLoadDataReady(state, is_online, is_private, id) {
      return R.threadP()(R.ifElse(function () {
        return is_online;
      }, function () {
        return gamesModel.loadOnlineGameP(is_private, id);
      }, function () {
        return gamesModel.loadLocalGameP(id, state.local_games);
      }), function (data) {
        return appActionService.do('Game.load.dataLoaded', data);
      });
    }
    function actionGameLoadDataLoaded(state, data) {
      loading.send(true);
      R.threadP(data)(gameModel.loadP, function (game) {
        return appActionService.do('Game.load.gameLoaded', game);
      });
      return appModesService.reset(state);
    }
    function actionGameLoadGameLoaded(state, game) {
      loading.send(false);
      var user = R.view(USER_NAME_LENS, state);
      return R.threadP(game)(R.when(gameModel.isOnline, gameConnectionModel.openP$(user)), function (game) {
        return appActionService.do('Game.set', game);
      });
    }
    function actionGameConnectionClose(state) {
      return R.over(GAME_LENS, gameConnectionModel.cleanup, state);
    }
    // function stateGameOnCommandExecute(state, _event_, [cmd, args]) {
    //   return R.threadP(state.game)(
    //     gameModel.executeCommandP$(cmd, args),
    //     (game) => appStateService.reduce('Game.set', game)
    //   ).catch((error) => appStateService.emit('Game.error', error));
    // }
    // function stateGameOnCommandUndo(state, _event_, [cmd]) {
    //   return R.threadP(state.game)(
    //     gameModel.undoCommandP$(cmd),
    //     (game) => appStateService.reduce('Game.set', game)
    //   ).catch((error) => appStateService.emit('Game.error', error));
    // }
    // function stateGameOnCommandUndoLast(state, _event_) {
    //   return R.threadP(state.game)(
    //     gameModel.undoLastCommandP,
    //     (game) => appStateService.reduce('Game.set', game)
    //   ).catch((error) => appStateService.emit('Game.error', error));
    // }
    // function stateGameOnCommandReplay(state, _event_, [cmd]) {
    //   return R.threadP(state.game)(
    //     gameModel.replayCommandP$(cmd),
    //     (game) => appStateService.reduce('Game.set', game)
    //   ).catch((error) => appStateService.emit('Game.error', error));
    // }
    // function stateGameOnCommandReplayBatch(state, _event_, [cmds]) {
    //   return R.threadP(state.game)(
    //     gameModel.replayCommandsBatchP$(cmds),
    //     (game) => appStateService.reduce('Game.set', game)
    //   ).catch((error) => appStateService.emit('Game.error', error));
    // }
    // function stateGameOnCommandReplayNext(state, _event_) {
    //   return R.threadP(state.game)(
    //     gameModel.replayNextCommandP,
    //     (game) => appStateService.reduce('Game.set', game)
    //   ).catch((error) => appStateService.emit('Game.error', error));
    // }
    // function stateGameOnSetCmds(state, _event_, [set]) {
    //   return R.over(
    //     GAME_LENS,
    //     R.assoc(set.where, set.cmds),
    //     state
    //   );
    // }
    // function stateGameOnSetPlayers(state, _event_, [players]) {
    //   return R.over(
    //     GAME_LENS,
    //     R.assoc('players', players),
    //     state
    //   );
    // }
    // function stateGameOnNewChatMsg(state, _event_, [msg]) {
    //   return R.over(
    //     GAME_LENS,
    //     R.over(R.lensProp('chat'),
    //            R.compose(R.append(msg.chat), R.defaultTo([]))),
    //     state
    //   );
    // }
    // function stateGameOnUiStateFlip(state) {
    //   return R.over(
    //     UI_STATE_LENS,
    //     R.over(R.lensProp('flipped'), R.not),
    //     state
    //   );
    // }
    // function stateGameOnInvitePlayer(state, _event_, to) {
    //   const msg = [
    //     s.capitalize(R.pathOr('Unknown', ['user','state','name'], state)),
    //     'has invited you to join a game'
    //   ].join(' ');
    //   const link = self.window.location.hash;
    //   console.log('Invite player', to, msg, link);

    //   appStateService
    //     .chainReduce('User.sendChatMsg',
    //                  { to: [to], msg: msg, link: link });
    // }
    // function stateGameOnModelCreate(state, _event_, [model_path, repeat]) {
    //   appStateService.chainReduce('Modes.switchTo', 'CreateModel');
    //   return R.assoc('create', {
    //     base: { x: 240, y: 240, r: 0 },
    //     models: R.times((i) => ({
    //       info: model_path,
    //       x: 20*i, y: 0, r: 0
    //     }), R.defaultTo(1, repeat))
    //   }, state);
    // }
    // function stateGameOnModelCopy(state, _event_, [create]) {
    //   appStateService.chainReduce('Modes.switchTo', 'CreateModel');
    //   return R.assoc('create', create, state);
    // }
    // function stateGameOnModelImportList(state, _event_, [list]) {
    //   const user = R.pathOr('Unknown', ['user','state','name'], state);
    //   appStateService.chainReduce('Modes.switchTo', 'CreateModel');
    //   return R.assoc(
    //     'create',
    //     gameFactionsModel.buildModelsList(list, user, state.factions.references),
    //     state
    //   );
    // }
    // function stateGameOnModelImportFile(_state_, _event_, [file]) {
    //   return R.threadP(file)(
    //     fileImportService.readP$('json'),
    //     (create) => {
    //       appStateService.reduce('Game.model.importFileData', create);
    //     }
    //   ).catch(error => appStateService.emit('Game.error', error));
    // }
    // function stateGameOnModelImportFileData(state, _event_, [create]) {
    //   appStateService.chainReduce('Modes.switchTo', 'CreateModel');
    //   return R.assoc('create', create, state);
    // }
    // // function stateGameOnModelSelectionLocalChange(state, _event_) {
    // //   // console.warn('onModelSelectionLocalChange', arguments);
    // //   const local_model_selection = gameModelSelectionModel
    // //           .get('local', state.game.model_selection);
    // //   const length = R.length(local_model_selection);
    // //   const previous_selection = R.path(['_model_selection_listener','stamp'], state);
    // //   if(length === 1 &&
    // //      local_model_selection[0] === previous_selection) {
    // //     return;
    // //   }
    // //   cleanupModelSelectionListener(state);
    // //   if(length === 1) {
    // //     setupModelSelectionListener(local_model_selection[0], state);
    // //   }
    // //   else {
    // //     appStateService.emit('Game.model.selection.local.updateSingle',
    // //                             null, null);
    // //   }
    // // }
    // // function setupModelSelectionListener(stamp, state) {
    // //   // console.warn('setupModelSelectionListener', arguments);
    // //   state._model_selection_listener = {
    // //     stamp: stamp,
    // //     unsubscribe: state
    // //       .onChangeEvent(`Game.model.change.${stamp}`,
    // //                      onModelSelectionChange(stamp, state))
    // //   };
    // // }
    // // function onModelSelectionChange(stamp, state) {
    // //   return () => {
    // //     // console.warn('onModelSelectionChange', arguments);
    // //     return R.threadP(state.game)(
    // //       R.prop('models'),
    // //       gameModelsModel.findStampP$(stamp),
    // //       (model) => {
    // //         appStateService.emit('Game.model.selection.local.updateSingle',
    // //                                 stamp, model);
    // //       }
    // //     );
    // //   };
    // // }
    // // function cleanupModelSelectionListener(state) {
    // //   // console.warn('cleanupModelSelectionListener', arguments);
    // //   const unsubscribe = R.thread(state)(
    // //     R.path(['_model_selection_listener','unsubscribe']),
    // //     R.defaultTo(() => {})
    // //   );
    // //   unsubscribe();
    // //   state._model_selection_listener = {};
    // // }
    // function stateGameOnTemplateCreate(state, _event_, [type]) {
    //   appStateService.chainReduce('Modes.switchTo', 'CreateTemplate');
    //   return R.assoc('create', {
    //     base: { x: 240, y: 240, r: 0 },
    //     templates: [ { type: type, x: 0, y: 0, r: 0 } ]
    //   }, state);
    // }
    // // function stateGameOnTemplateSelectionLocalChange(state, _event_) {
    // //   console.warn('onTemplateSelectionLocalChange', arguments);
    // //   const local_template_selection = gameTemplateSelectionModel
    // //           .get('local', state.game.template_selection);
    // //   const length = R.length(local_template_selection);
    // //   const previous_selection =
    // //           R.path(['_template_selection_listener','stamp'], state);
    // //   if(length === 1 &&
    // //      local_template_selection[0] === previous_selection) {
    // //     return;
    // //   }
    // //   cleanupTemplateSelectionListener(state);
    // //   if(length === 1) {
    // //     setupTemplateSelectionListener(local_template_selection[0], state);
    // //   }
    // //   else {
    // //     appStateService.emit('Game.template.selection.local.updateSingle',
    // //                             null, null);
    // //   }
    // // }
    // // function setupTemplateSelectionListener(stamp, state) {
    // //   console.warn('setupTemplateSelectionListener', arguments);
    // //   state._template_selection_listener = {
    // //     stamp: stamp,
    // //     unsubscribe: state
    // //       .onChangeEvent(`Game.template.change.${stamp}`,
    // //                      onTemplateSelectionChange(stamp, state))
    // //   };
    // // }
    // // function onTemplateSelectionChange(stamp, state) {
    // //   return () => {
    // //     console.warn('onTemplateSelectionChange', arguments);
    // //     return R.threadP(state.game)(
    // //       R.prop('templates'),
    // //       gameTemplatesModel.findStampP$(stamp),
    // //       (template) => {
    // //         appStateService.emit('Game.template.selection.local.updateSingle',
    // //                                 stamp, template);
    // //       }
    // //     );
    // //   };
    // // }
    // // function cleanupTemplateSelectionListener(state) {
    // //   console.warn('cleanupTemplateSelectionListener', arguments);
    // //   const unsubscribe = R.thread(state)(
    // //     R.path(['_template_selection_listener','unsubscribe']),
    // //     R.defaultTo(() => {})
    // //   );
    // //   unsubscribe();
    // //   state._template_selection_listener = {};
    // // }
    // function stateGameOnTerrainCreate(state, _event_, [path]) {
    //   appStateService.chainReduce('Modes.switchTo', 'CreateTerrain');
    //   return R.assoc('create', {
    //     base: { x: 240, y: 240, r: 0 },
    //     terrains: [ {
    //       info: path,
    //       x: 0, y: 0, r: 0
    //     } ]
    //   }, state);
    // }
    // function stateGameOnTerrainReset(state) {
    //   return R.threadP(state)(
    //     R.view(GAME_LENS),
    //     R.prop('terrains'),
    //     gameTerrainsModel.all,
    //     R.pluck('state'),
    //     R.pluck('stamp'),
    //     (stamps) => {
    //       appStateService.reduce('Game.command.execute',
    //                              'deleteTerrain', [stamps]);
    //     }
    //   ).catch((error) => appStateService.emit('Game.error', error));
    // }
    // function stateGameOnBoardSet(state, _event_, [name]) {
    //   const board = gameBoardModel.forName(name, state.boards);
    //   self.window.requestAnimationFrame(() => {
    //     appStateService.reduce('Game.command.execute',
    //                            'setBoard', [board]);
    //   });
    // }
    // function stateGameOnBoardSetRandom(state, _event_) {
    //   let board, name = gameBoardModel.name(state.game.board);
    //   while(name === gameBoardModel.name(state.game.board)) {
    //     board = state.boards[R.randomRange(0, state.boards.length-1)];
    //     name = gameBoardModel.name(board);
    //   }
    //   self.window.requestAnimationFrame(() => {
    //     appStateService.reduce('Game.command.execute',
    //                            'setBoard', [board]);
    //   });
    // }
    // function stateGameOnBoardImportFile(_state_, _event_, [file]) {
    //   R.threadP(file)(
    //     fileImportService.readP$('json'),
    //     R.spyWarn('import'),
    //     R.tap(R.pipe(
    //       R.prop('board'),
    //       R.rejectIfP(R.isNil, 'No board'),
    //       R.spyWarn('import'),
    //       (board) => {
    //         appStateService
    //           .chainReduce('Game.command.execute',
    //                        'setBoard', [board]);
    //       }
    //     )),
    //     R.tap((data) => R.thread(data)(
    //       R.path(['terrain', 'terrains']),
    //       R.rejectIfP(R.isEmpty, 'No terrain'),
    //       R.spyWarn('import', data),
    //       () => {
    //         appStateService
    //           .chainReduce('Game.terrain.reset');
    //         appStateService
    //           .chainReduce('Game.command.execute',
    //                        'createTerrain', [data.terrain, false]);
    //       }
    //     ))
    //   ).catch(R.spyAndDiscardError('Import board file'));
    // }
    // function stateGameOnScenarioSet(_state_, _event_, [name, group]) {
    //   const scenario = gameScenarioModel.forName(name, group);
    //   self.window.requestAnimationFrame(() => {
    //     appStateService.reduce('Game.command.execute',
    //                            'setScenario', [scenario]);
    //   });
    // }
    // function stateGameOnScenarioSetRandom(state, _event_) {
    //   const group = gameScenarioModel.group('SR15', state.scenarios);
    //   let scenario, name = gameScenarioModel.name(state.game.scenario);
    //   while(name === gameScenarioModel.name(state.game.scenario)) {
    //     scenario = group[1][R.randomRange(0, group[1].length-1)];
    //     name = gameScenarioModel.name(scenario);
    //   }
    //   self.window.requestAnimationFrame(() => {
    //     appStateService.reduce('Game.command.execute',
    //                            'setScenario', [scenario]);
    //   });
    // }
    // // function stateGameOnScenarioRefresh(state, _event_) {
    // //   appStateService.emit('Game.scenario.refresh');
    // // }
    // function stateGameOnScenarioGenerateObjectives(state, _event_) {
    //   R.thread(state.game)(
    //     deleteCurrentObjectives,
    //     () => gameScenarioModel
    //       .createObjectives(state.game.scenario),
    //     (objectives) => {
    //       const is_flipped = R.path(['ui_state','flip_map'], state);
    //       return appStateService
    //         .chainReduce('Game.command.execute',
    //                      'createModel',
    //                      [objectives, is_flipped]);
    //     }
    //   ).catch(gameModel.actionError$(state));

    //   function deleteCurrentObjectives(game) {
    //     return R.threadP(game)(
    //       R.prop('models'),
    //       gameModelsModel.all,
    //       R.filter(R.pipe(
    //         R.path(['state','info']),
    //         R.head,
    //         R.equals('scenario')
    //       )),
    //       R.map(R.path(['state','stamp'])),
    //       R.unless(
    //         R.isEmpty,
    //         (stamps) => {
    //           appStateService
    //             .chainReduce('Game.command.execute',
    //                          'deleteModel', [stamps]);
    //         }
    //       )
    //     );
    //   }
    // }
    // function stateGameUpdateExport(exp, current_game) {
    //   fileExportService.cleanup(exp.url);
    //   return {
    //     name: 'clicknfeat_game.json',
    //     url: fileExportService.generate('json', current_game)
    //   };
    // }
    // function stateGameSaveCurrent(_event_, [game]) {
    //   if(R.isNil(R.prop('local_stamp', R.defaultTo({}, game)))) {
    //     return;
    //   }
    //   self.window.requestAnimationFrame(() => {
    //     appStateService.reduce('Games.local.update', game);
    //   });
    // }
    // function stateGameUpdateModelsExport(exp) {
    //   fileExportService.cleanup(exp.url);
    //   const state = appStateService.current();
    //   const data = R.thread(state)(
    //      R.path(['game','model_selection']),
    //      gameModelSelectionModel.get$('local'),
    //      gameModelsModel
    //        .copyStamps$(R.__, R.path(['game', 'models'], state))
    //   );
    //   return {
    //     name: 'clicknfeat_models.json',
    //     url: fileExportService.generate('json', data)
    //   };
    // }
    // function stateGameUpdateBoardExport(exp) {
    //   fileExportService.cleanup(exp.url);
    //   const state = appStateService.current();
    //   const data = R.thread(state)(
    //     R.prop('game'),
    //     (game) => ({
    //       board: game.board,
    //       terrain: {
    //         base: { x: 0, y: 0, r: 0 },
    //         terrains: R.thread(game.terrains)(
    //           gameTerrainsModel.all,
    //           R.pluck('state'),
    //           R.map(R.pick(['x','y','r','info','lk']))
    //         )
    //       }
    //     })
    //   );
    //   return {
    //     name: 'clicknfeat_board.json',
    //     url: fileExportService.generate('json', data)
    //   };
    // }
    // function stateGameCheckMode() {
    //   const state = appStateService.current();
    //   const game = R.propOr({}, 'game', state);
    //   const current_mode = modesModel.currentModeName(state.modes);
    //   const mode = R.thread()(
    //     () => gameTerrainSelectionModel
    //       .checkMode(R.propOr({}, 'terrain_selection', game)),
    //     R.unless(
    //       R.exists,
    //       () => gameTemplateSelectionModel
    //         .checkMode(R.propOr({}, 'template_selection', game))
    //     ),
    //     R.unless(
    //       R.exists,
    //       () => gameModelSelectionModel
    //         .checkMode(game.models, R.propOr({}, 'model_selection', game))
    //     ),
    //     R.defaultTo('Default')
    //   );
    //   if(R.exists(mode) &&
    //      mode !== current_mode) {
    //     appStateService.chainReduce('Modes.switchTo', mode);
    //   }
    // }
    // function stateGameCloseOsd() {
    //   appStateService.emit('Game.selectionDetail.close');
    //   appStateService.emit('Game.editDamage.close');
    //   appStateService.emit('Game.editLabel.close');
    // }
  }
})();
//# sourceMappingURL=game.js.map
