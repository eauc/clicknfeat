(function() {
  angular.module('clickApp.services')
    .factory('stateGame', stateGameModelFactory);

  stateGameModelFactory.$inject = [
    'fileExport',
    'fileImport',
    'appState',
    'state',
    'modes',
    'games',
    'game',
    'gameBoard',
    'gameConnection',
    'gameFactions',
    // 'gameModels',
    'gameModelSelection',
    'gameScenario',
    'gameTerrains',
    // 'gameTemplates',
    'gameTemplateSelection',
    'gameTerrainSelection',
    'allCommands',
    // 'allTemplates',
  ];
  function stateGameModelFactory(fileExportService,
                                 fileImportService,
                                 appStateService,
                                 stateModel,
                                 modesModel,
                                 gamesModel,
                                 gameModel,
                                 gameBoardModel,
                                 gameConnectionModel,
                                 gameFactionsModel,
                                 // gameModelsModel,
                                 gameModelSelectionModel,
                                 gameScenarioModel,
                                 gameTerrainsModel,
                                 // gameTemplatesModel,
                                 gameTemplateSelectionModel,
                                 gameTerrainSelectionModel) {
    const GAME_LENS = R.lensProp('game');
    const UI_STATE_LENS = R.lensProp('ui_state');
    const stateGameModel = {
      create: stateGamesCreate,
      onUpdate: stateGameOnUpdate,
      onSet: stateGameOnSet,
      onLoad: stateGameOnLoad,
      onLoadDataReady: stateGameOnLoadDataReady,
      onLoadDataLoaded: stateGameOnLoadDataLoaded,
      onLoadGameLoaded: stateGameOnLoadGameLoaded,
      onConnectionClose: stateGameOnConnectionClose,
      onCommandExecute: stateGameOnCommandExecute,
      onCommandUndo: stateGameOnCommandUndo,
      onCommandUndoLast: stateGameOnCommandUndoLast,
      onCommandReplay: stateGameOnCommandReplay,
      onCommandReplayNext: stateGameOnCommandReplayNext,
      onCommandReplayBatch: stateGameOnCommandReplayBatch,
      onSetCmds: stateGameOnSetCmds,
      onSetPlayers: stateGameOnSetPlayers,
      onNewChatMsg: stateGameOnNewChatMsg,
      onUiStateFlip: stateGameOnUiStateFlip,
      // onUpdate: stateGameOnUpdate,
      // onInvitePlayer: stateGameOnInvitePlayer,
      onModelCreate: stateGameOnModelCreate,
      onModelCopy: stateGameOnModelCopy,
      onModelImportList: stateGameOnModelImportList,
      onModelImportFile: stateGameOnModelImportFile,
      onModelImportFileData: stateGameOnModelImportFileData,
      // onModelSelectionLocalChange: stateGameOnModelSelectionLocalChange,
      onTemplateCreate: stateGameOnTemplateCreate,
      // onTemplateSelectionLocalChange: stateGameOnTemplateSelectionLocalChange,
      onTerrainCreate: stateGameOnTerrainCreate,
      onTerrainReset: stateGameOnTerrainReset,
      onBoardSet: stateGameOnBoardSet,
      onBoardSetRandom: stateGameOnBoardSetRandom,
      // onBoardImportFile: stateGameOnBoardImportFile,
      onScenarioSet: stateGameOnScenarioSet,
      onScenarioSetRandom: stateGameOnScenarioSetRandom,
      // onScenarioRefresh: stateGameOnScenarioRefresh,
      // onScenarioGenerateObjectives: stateGameOnScenarioGenerateObjectives,
      // onSelectionLocalChange: stateGameOnSelectionLocalChange,
      updateExport: stateGameUpdateExport,
      saveCurrent: stateGameSaveCurrent,
      checkMode: stateGameCheckMode,
      closeOsd: stateGameCloseOsd
    };
    // const exportCurrentGame = stateExportsModel
    //         .exportP$('game', R.prop('game'));
    // const exportCurrentBoard = stateExportsModel
    //         .exportP$('board', exportBoardData);
    R.curryService(stateGameModel);
    stateModel.register(stateGameModel);
    return stateGameModel;

    function stateGamesCreate(state) {
      appStateService
        .addReducer('Game.update'              , stateGameModel.onUpdate)
        .addReducer('Game.set'                 , stateGameModel.onSet)
        .addReducer('Game.load'                , stateGameModel.onLoad)
        .addReducer('Game.load.dataReady'      , stateGameModel.onLoadDataReady)
        .addReducer('Game.load.dataLoaded'     , stateGameModel.onLoadDataLoaded)
        .addReducer('Game.load.gameLoaded'     , stateGameModel.onLoadGameLoaded)
        .addReducer('Game.connection.close'    , stateGameModel.onConnectionClose)
        .addReducer('Game.command.execute'     , stateGameModel.onCommandExecute)
        .addReducer('Game.command.undo'        , stateGameModel.onCommandUndo)
        .addReducer('Game.command.replay'      , stateGameModel.onCommandReplay)
        .addReducer('Game.command.replayBatch' , stateGameModel.onCommandReplayBatch)
        .addReducer('Game.command.undoLast'    , stateGameModel.onCommandUndoLast)
        .addReducer('Game.command.replayNext'  , stateGameModel.onCommandReplayNext)
        .addReducer('Game.setCmds'             , stateGameModel.onSetCmds)
        .addReducer('Game.setPlayers'          , stateGameModel.onSetPlayers)
        .addReducer('Game.newChatMsg'          , stateGameModel.onNewChatMsg)
        .addReducer('Game.uiState.flip'        , stateGameModel.onUiStateFlip)
        .addReducer('Game.board.set'           , stateGameModel.onBoardSet)
        .addReducer('Game.board.setRandom'     , stateGameModel.onBoardSetRandom)
        .addReducer('Game.scenario.set'        , stateGameModel.onScenarioSet)
        .addReducer('Game.scenario.setRandom'  , stateGameModel.onScenarioSetRandom)
        .addReducer('Game.model.create'        , stateGameModel.onModelCreate)
        .addReducer('Game.model.copy'          , stateGameModel.onModelCopy)
        .addReducer('Game.model.importList'    , stateGameModel.onModelImportList)
        .addReducer('Game.model.importFile'    , stateGameModel.onModelImportFile)
        .addReducer('Game.model.importFileData', stateGameModel.onModelImportFileData)
        .addReducer('Game.template.create'     , stateGameModel.onTemplateCreate)
        .addReducer('Game.terrain.create'      , stateGameModel.onTerrainCreate)
        .addReducer('Game.terrain.reset'       , stateGameModel.onTerrainReset)
        .addListener('Game.change'             , stateGameModel.saveCurrent)
        .addListener('Modes.change',
                     stateGameModel.closeOsd)
        .addListener('Game.template_selection.local.change',
                     stateGameModel.checkMode)
        .addListener('Game.terrain_selection.local.change',
                     stateGameModel.checkMode)
        .addListener('Game.model_selection.local.change',
                     stateGameModel.checkMode);
        // .addReducer('Game.invitePlayer'        , stateGameModel.onInvitePlayer)
        // .addReducer('Game.template.create'     , stateGameModel.onTemplateCreate)
        // .addReducer('Game.board.importFile'    , stateGameModel.onBoardImportFile)
        // .addReducer('Game.scenario.refresh'    , stateGameModel.onScenarioRefresh)
        // .addReducer('Game.scenario.generateObjectives',
        //             stateGameModel.onScenarioGenerateObjectives)
        // .addListener('Game.model.selection.local.change',
        //              stateGameModel.onModelSelectionLocalChange)
        // .addListener('Game.template.selection.local.change',
        //              stateGameModel.onGameTemplateSelectionLocalChange)
        // .addListener('Game.selection.local.change',
        //              stateGameModel.onGameSelectionLocalChange);

      appStateService
        .onChange('AppState.change',
                  'Game.change',
                  R.view(GAME_LENS));
      const game_export_cell = appStateService
        .cell('Game.change',
              stateGameModel.updateExport,
              {});
      appStateService
        .onChange('Game.change',
                  'Game.layers.change',
                  R.pipe(R.defaultTo({}), R.prop('layers')));
      appStateService
        .onChange('AppState.change',
                  'Modes.change',
                  R.path(['modes','current','name']));
      appStateService
        .onChange('Game.change',
                  'Game.command.change',
                  [ R.prop('commands'),
                    R.prop('commands_log'),
                    R.prop('undo'),
                    R.prop('undo_log')
                  ]);
      appStateService
        .onChange('AppState.change',
                  'Game.view.flipMap',
                  R.pipe(R.view(UI_STATE_LENS), R.prop('flipped')));
      appStateService
        .onChange('Game.change',
                  'Game.dice.change',
                  R.prop('dice'));
      appStateService
        .onChange('Game.change',
                  'Game.board.change',
                  R.prop('board'));
      appStateService
        .onChange('Game.change',
                  'Game.scenario.change',
                  R.prop('scenario'));
      appStateService
        .onChange('AppState.change',
                  'Create.base.change',
                  R.path(['create','base']));
      appStateService
        .onChange('Game.change',
                  'Game.models.change',
                  R.prop(['models']));
      appStateService
        .onChange('Game.change',
                  'Game.model_selection.change',
                  R.prop('model_selection'));
      appStateService
        .onChange('Game.model_selection.change',
                  'Game.model_selection.local.change',
                  R.prop('local'));
      appStateService
        .onChange('Game.change',
                  'Game.templates.change',
                  R.prop(['templates']));
      appStateService
        .onChange('Game.change',
                  'Game.template_selection.change',
                  R.prop('template_selection'));
      appStateService
        .onChange('Game.template_selection.change',
                  'Game.template_selection.local.change',
                  R.prop('local'));
      appStateService
        .onChange('Game.change',
                  'Game.terrains.change',
                  R.prop(['terrains']));
      appStateService
        .onChange('Game.change',
                  'Game.terrain_selection.change',
                  R.prop('terrain_selection'));
      appStateService
        .onChange('Game.terrain_selection.change',
                  'Game.terrain_selection.local.change',
                  R.prop('local'));
      appStateService
        .onChange('Game.change',
                  'Game.ruler.remote.change',
                  R.path(['ruler','remote']));
      appStateService
        .onChange('Game.change',
                  'Game.ruler.local.change',
                  R.path(['ruler','local']));

      return R.thread(state)(
        R.set(UI_STATE_LENS, { flipped: false }),
        R.set(GAME_LENS, {}),
        R.assocPath(['exports', 'game'], game_export_cell)
      );
    }
    // function stateGameSave(state) {
    //   return R.thread()(
    //     () => exportCurrentModelSelectionP(state),
    //     () => exportCurrentBoard(state)
    //   );
    // }
    function stateGameOnUpdate(state, _event_, [fn]) {
      return R.over(GAME_LENS, fn, state);
    }
    function stateGameOnSet(state, _event_, [game]) {
      return R.set(GAME_LENS, game, state);
    }
    function stateGameOnLoad(state, _event_, [is_online, is_private, id]) {
      return waitForDataReady()
        .then(() => appStateService
              .reduce('Game.load.dataReady', is_online, is_private, id));

      function waitForDataReady() {
        return R.allP([
          state.data_ready,
          state.user_ready,
          state.games_ready
        ]);
      }
    }
    function stateGameOnLoadDataReady(state, _event_, [is_online, is_private, id]) {
      return R.threadP()(
        R.ifElse(
          () => is_online,
          () => gamesModel.loadOnlineGameP(is_private, id),
          () => gamesModel.loadLocalGameP(id, state.local_games)
        ),
        (data) => appStateService
          .reduce('Game.load.dataLoaded', data)
      );
    }
    function stateGameOnLoadDataLoaded(state, _event_, [data]) {
      appStateService.emit('Game.loading');
      R.threadP(data)(
        gameModel.loadP,
        (game) => appStateService
          .reduce('Game.load.gameLoaded', game)
      );
      return R.assoc('modes', modesModel.init(), state);
    }
    function stateGameOnLoadGameLoaded(state, _event_, [game]) {
      appStateService.emit('Game.loaded');
      const user = R.path(['user','state','name'], state);
      return R.threadP(game)(
        R.when(
          gameModel.isOnline,
          gameConnectionModel.openP$(user)
        ),
        (game) => appStateService
          .reduce('Game.set', game)
      );
    }
    function stateGameOnConnectionClose(state, _event_) {
      return R.over(
        GAME_LENS,
        gameConnectionModel.cleanup,
        state
      );
    }
    function stateGameOnCommandExecute(state, _event_, [cmd, args]) {
      return R.threadP(state.game)(
        gameModel.executeCommandP$(cmd, args),
        (game) => appStateService.reduce('Game.set', game)
      ).catch((error) => appStateService.emit('Game.error', error));
    }
    function stateGameOnCommandUndo(state, _event_, [cmd]) {
      return R.threadP(state.game)(
        gameModel.undoCommandP$(cmd),
        (game) => appStateService.reduce('Game.set', game)
      ).catch((error) => appStateService.emit('Game.error', error));
    }
    function stateGameOnCommandUndoLast(state, _event_) {
      return R.threadP(state.game)(
        gameModel.undoLastCommandP,
        (game) => appStateService.reduce('Game.set', game)
      ).catch((error) => appStateService.emit('Game.error', error));
    }
    function stateGameOnCommandReplay(state, _event_, [cmd]) {
      return R.threadP(state.game)(
        gameModel.replayCommandP$(cmd),
        (game) => appStateService.reduce('Game.set', game)
      ).catch((error) => appStateService.emit('Game.error', error));
    }
    function stateGameOnCommandReplayBatch(state, _event_, [cmds]) {
      return R.threadP(state.game)(
        gameModel.replayCommandsBatchP$(cmds),
        (game) => appStateService.reduce('Game.set', game)
      ).catch((error) => appStateService.emit('Game.error', error));
    }
    function stateGameOnCommandReplayNext(state, _event_) {
      return R.threadP(state.game)(
        gameModel.replayNextCommandP,
        (game) => appStateService.reduce('Game.set', game)
      ).catch((error) => appStateService.emit('Game.error', error));
    }
    function stateGameOnSetCmds(state, _event_, [set]) {
      return R.over(
        GAME_LENS,
        R.assoc(set.where, set.cmds),
        state
      );
    }
    function stateGameOnSetPlayers(state, _event_, [players]) {
      return R.over(
        GAME_LENS,
        R.assoc('players', players),
        state
      );
    }
    function stateGameOnNewChatMsg(state, _event_, [msg]) {
      return R.over(
        GAME_LENS,
        R.over(R.lensProp('chat'),
               R.compose(R.append(msg.chat), R.defaultTo([]))),
        state
      );
    }
    function stateGameOnUiStateFlip(state) {
      return R.over(
        UI_STATE_LENS,
        R.over(R.lensProp('flipped'), R.not),
        state
      );
    }
    // function stateGameOnUpdate(state, _event_, [lens, update]) {
    //   return R.over(
    //     GAME_LENS,
    //     R.over(lens, update),
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

    //   return state.eventP('User.sendChatMsg',
    //                       { to: [to], msg: msg, link: link });
    // }
    function stateGameOnModelCreate(state, _event_, [model_path, repeat]) {
      appStateService.chainReduce('Modes.switchTo', 'CreateModel');
      return R.assoc('create', {
        base: { x: 240, y: 240, r: 0 },
        models: R.times((i) => ({
          info: model_path,
          x: 20*i, y: 0, r: 0
        }), R.defaultTo(1, repeat))
      }, state);
    }
    function stateGameOnModelCopy(state, _event_, [create]) {
      appStateService.chainReduce('Modes.switchTo', 'CreateModel');
      return R.assoc('create', create, state);
    }
    function stateGameOnModelImportList(state, _event_, [list]) {
      const user = R.pathOr('Unknown', ['user','state','name'], state);
      appStateService.chainReduce('Modes.switchTo', 'CreateModel');
      return R.assoc(
        'create',
        gameFactionsModel.buildModelsList(list, user, state.factions.references),
        state
      );
    }
    function stateGameOnModelImportFile(_state_, _event_, [file]) {
      return R.threadP(file)(
        fileImportService.readP$('json'),
        (create) => {
          appStateService.reduce('Game.model. importFileDate', [create]);
        }
      ).catch(error => appStateService.emit('Game.error', error));
    }
    function stateGameOnModelImportFileData(state, _event_, [create]) {
      appStateService.chainReduce('Modes.switchTo', 'CreateModel');
      return R.assoc('create', create, state);
    }
    // function stateGameOnModelSelectionLocalChange(state, _event_) {
    //   // console.warn('onModelSelectionLocalChange', arguments);
    //   const local_model_selection = gameModelSelectionModel
    //           .get('local', state.game.model_selection);
    //   const length = R.length(local_model_selection);
    //   const previous_selection = R.path(['_model_selection_listener','stamp'], state);
    //   if(length === 1 &&
    //      local_model_selection[0] === previous_selection) {
    //     return;
    //   }
    //   cleanupModelSelectionListener(state);
    //   if(length === 1) {
    //     setupModelSelectionListener(local_model_selection[0], state);
    //   }
    //   else {
    //     appStateService.emit('Game.model.selection.local.updateSingle',
    //                             null, null);
    //   }
    // }
    // function setupModelSelectionListener(stamp, state) {
    //   // console.warn('setupModelSelectionListener', arguments);
    //   state._model_selection_listener = {
    //     stamp: stamp,
    //     unsubscribe: state
    //       .onChangeEvent(`Game.model.change.${stamp}`,
    //                      onModelSelectionChange(stamp, state))
    //   };
    // }
    // function onModelSelectionChange(stamp, state) {
    //   return () => {
    //     // console.warn('onModelSelectionChange', arguments);
    //     return R.threadP(state.game)(
    //       R.prop('models'),
    //       gameModelsModel.findStampP$(stamp),
    //       (model) => {
    //         appStateService.emit('Game.model.selection.local.updateSingle',
    //                                 stamp, model);
    //       }
    //     );
    //   };
    // }
    // function cleanupModelSelectionListener(state) {
    //   // console.warn('cleanupModelSelectionListener', arguments);
    //   const unsubscribe = R.thread(state)(
    //     R.path(['_model_selection_listener','unsubscribe']),
    //     R.defaultTo(() => {})
    //   );
    //   unsubscribe();
    //   state._model_selection_listener = {};
    // }
    function stateGameOnTemplateCreate(state, _event_, [type]) {
      appStateService.chainReduce('Modes.switchTo', 'CreateTemplate');
      return R.assoc('create', {
        base: { x: 240, y: 240, r: 0 },
        templates: [ { type: type, x: 0, y: 0, r: 0 } ]
      }, state);
    }
    // function stateGameOnTemplateSelectionLocalChange(state, _event_) {
    //   console.warn('onTemplateSelectionLocalChange', arguments);
    //   const local_template_selection = gameTemplateSelectionModel
    //           .get('local', state.game.template_selection);
    //   const length = R.length(local_template_selection);
    //   const previous_selection =
    //           R.path(['_template_selection_listener','stamp'], state);
    //   if(length === 1 &&
    //      local_template_selection[0] === previous_selection) {
    //     return;
    //   }
    //   cleanupTemplateSelectionListener(state);
    //   if(length === 1) {
    //     setupTemplateSelectionListener(local_template_selection[0], state);
    //   }
    //   else {
    //     appStateService.emit('Game.template.selection.local.updateSingle',
    //                             null, null);
    //   }
    // }
    // function setupTemplateSelectionListener(stamp, state) {
    //   console.warn('setupTemplateSelectionListener', arguments);
    //   state._template_selection_listener = {
    //     stamp: stamp,
    //     unsubscribe: state
    //       .onChangeEvent(`Game.template.change.${stamp}`,
    //                      onTemplateSelectionChange(stamp, state))
    //   };
    // }
    // function onTemplateSelectionChange(stamp, state) {
    //   return () => {
    //     console.warn('onTemplateSelectionChange', arguments);
    //     return R.threadP(state.game)(
    //       R.prop('templates'),
    //       gameTemplatesModel.findStampP$(stamp),
    //       (template) => {
    //         appStateService.emit('Game.template.selection.local.updateSingle',
    //                                 stamp, template);
    //       }
    //     );
    //   };
    // }
    // function cleanupTemplateSelectionListener(state) {
    //   console.warn('cleanupTemplateSelectionListener', arguments);
    //   const unsubscribe = R.thread(state)(
    //     R.path(['_template_selection_listener','unsubscribe']),
    //     R.defaultTo(() => {})
    //   );
    //   unsubscribe();
    //   state._template_selection_listener = {};
    // }
    function stateGameOnTerrainCreate(state, _event_, [path]) {
      appStateService.chainReduce('Modes.switchTo', 'CreateTerrain');
      return R.assoc('create', {
        base: { x: 240, y: 240, r: 0 },
        terrains: [ {
          info: path,
          x: 0, y: 0, r: 0
        } ]
      }, state);
    }
    function stateGameOnTerrainReset(state) {
      return R.threadP(state)(
        R.view(GAME_LENS),
        R.prop('terrains'),
        gameTerrainsModel.all,
        R.pluck('state'),
        R.pluck('stamp'),
        (stamps) => {
          appStateService.reduce('Game.command.execute',
                                 'deleteTerrain', [stamps]);
        }
      ).catch((error) => appStateService.emit('Game.error', error));
    }
    function stateGameOnBoardSet(state, _event_, [name]) {
      const board = gameBoardModel.forName(name, state.boards);
      self.window.requestAnimationFrame(() => {
        appStateService.reduce('Game.command.execute',
                               'setBoard', [board]);
      });
    }
    function stateGameOnBoardSetRandom(state, _event_) {
      let board, name = gameBoardModel.name(state.game.board);
      while(name === gameBoardModel.name(state.game.board)) {
        board = state.boards[R.randomRange(0, state.boards.length-1)];
        name = gameBoardModel.name(board);
      }
      self.window.requestAnimationFrame(() => {
        appStateService.reduce('Game.command.execute',
                               'setBoard', [board]);
      });
    }
    // function stateGameOnBoardImportFile(state, _event_, file) {
    //   return R.threadP(file)(
    //     fileImportService.readP$('json'),
    //     (data) => R.threadP(data)(
    //       R.prop('board'),
    //       R.rejectIfP(R.isNil, 'No board'),
    //       () => state.eventP('Game.command.execute',
    //                          'setBoard', [data.board]),
    //       R.always(data),
    //       R.path(['terrain', 'terrains']),
    //       R.rejectIfP(R.isEmpty, 'No terrain'),
    //       () => state.eventP('Game.terrain.reset'),
    //       () => state.eventP('Game.command.execute',
    //                          'createTerrain', [data.terrain, false])
    //     )
    //   ).catch(R.spyAndDiscardError('Import board file'));
    // }
    function stateGameOnScenarioSet(_state_, _event_, [name, group]) {
      const scenario = gameScenarioModel.forName(name, group);
      self.window.requestAnimationFrame(() => {
        appStateService.reduce('Game.command.execute',
                               'setScenario', [scenario]);
      });
    }
    function stateGameOnScenarioSetRandom(state, _event_) {
      const group = gameScenarioModel.group('SR15', state.scenarios);
      let scenario, name = gameScenarioModel.name(state.game.scenario);
      while(name === gameScenarioModel.name(state.game.scenario)) {
        scenario = group[1][R.randomRange(0, group[1].length-1)];
        name = gameScenarioModel.name(scenario);
      }
      self.window.requestAnimationFrame(() => {
        appStateService.reduce('Game.command.execute',
                               'setScenario', [scenario]);
      });
    }
    // function stateGameOnScenarioRefresh(state, _event_) {
    //   appStateService.emit('Game.scenario.refresh');
    // }
    // function stateGameOnScenarioGenerateObjectives(state, _event_) {
    //   return R.threadP(state.game)(
    //     deleteCurrentObjectivesP,
    //     () => gameScenarioModel
    //       .createObjectivesP(state.game.scenario),
    //     (objectives) => {
    //       const is_flipped = R.path(['ui_state','flip_map'], state);
    //       return state.eventP('Game.command.execute',
    //                           'createModel',
    //                           [objectives, is_flipped]);
    //     }
    //   ).catch(gameModel.actionError$(state));

    //   function deleteCurrentObjectivesP(game) {
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
    //         (stamps) => state.eventP('Game.command.execute',
    //                                  'deleteModel', [stamps])
    //       )
    //     );
    //   }
    // }
    // function stateGameOnSelectionLocalChange(state, _event_) {
    //   state.queueEventP('Modes.switchTo', 'Default');
    // }
    function stateGameUpdateExport(exp, current_game) {
      fileExportService.cleanup(exp.url);
      return {
        name: 'clicknfeat_game.json',
        url: fileExportService.generate('json', current_game)
      };
    }
    function stateGameSaveCurrent(_event_, [game]) {
      if(R.isNil(R.prop('local_stamp', R.defaultTo({}, game)))) {
        return;
      }
      self.window.requestAnimationFrame(() => {
        appStateService.reduce('Games.local.update', game);
      });
    }
    // function exportCurrentModelSelectionP(state) {
    //   return stateExportsModel
    //     .exportP('models', (state) => R.threadP(state)(
    //       R.path(['game','model_selection']),
    //       R.rejectIfP(R.isNil, 'selection is nil'),
    //       gameModelSelectionModel.get$('local'),
    //       R.rejectIfP(R.isEmpty, 'selection is empty'),
    //       (stamps) => gameModelsModel
    //         .copyStampsP(stamps, R.path(['game', 'models'], state)),
    //       R.rejectIfP(R.isEmpty, 'selection models not found')
    //     ), state);
    // }
    // function exportBoardData(state) {
    //   return R.thread(state)(
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
    // }
    function stateGameCheckMode() {
      const state = appStateService.current();
      const game = R.propOr({}, 'game', state);
      const current_mode = modesModel.currentModeName(state.modes);
      const mode = R.thread()(
        () => gameTerrainSelectionModel
          .checkMode(R.propOr({}, 'terrain_selection', game)),
        R.unless(
          R.exists,
          () => gameTemplateSelectionModel
            .checkMode(R.propOr({}, 'template_selection', game))
        ),
        R.unless(
          R.exists,
          () => gameModelSelectionModel
            .checkMode(game.models, R.propOr({}, 'model_selection', game))
        ),
        R.defaultTo('Default')
      );
      if(R.exists(mode) &&
         mode !== current_mode) {
        appStateService.chainReduce('Modes.switchTo', mode);
      }
    }
    function stateGameCloseOsd() {
      appStateService.emit('Game.selectionDetail.close');
      appStateService.emit('Game.editDamage.close');
      appStateService.emit('Game.editLabel.close');
    }
  }
})();
