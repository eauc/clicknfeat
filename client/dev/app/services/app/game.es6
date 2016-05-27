(function() {
  angular.module('clickApp.services')
    .factory('appGame', stateGameModelFactory);

  stateGameModelFactory.$inject = [
    'behaviours',
    'appAction',
    'appData',
    'appError',
    'appGames',
    'appModes',
    'appState',
    'appUser',
    'fileImport',
    'fileExport',
    'game',
    'gameBoard',
    'gameConnection',
    'gameScenario',
    'gameTemplates',
    'gameTemplateSelection',
    'gameTerrains',
    'gameTerrainSelection',
    'games',
    'modes',
    // 'appState',
    // 'state',
    // 'gameFactions',
    // 'gameModels',
    // 'gameModelSelection',
    // 'allCommands',
    'allTemplates',
  ];
  function stateGameModelFactory(behavioursModel,
                                 appActionService,
                                 appDataService,
                                 appErrorService,
                                 appGamesService,
                                 appModesService,
                                 appStateService,
                                 appUserService,
                                 fileImportService,
                                 fileExportService,
                                 gameModel,
                                 gameBoardModel,
                                 gameConnectionModel,
                                 gameScenarioModel,
                                 gameTemplatesModel,
                                 gameTemplateSelectionModel,
                                 gameTerrainsModel,
                                 gameTerrainSelectionModel,
                                 gamesModel,
                                 modesModel
                                 // appStateService,
                                 // stateModel,
                                 // gameFactionsModel,
                                 // gameModelsModel,
                                 // gameModelSelectionModel
  ) {
    const GAME_LENS = R.lensProp('game');
    const USER_NAME_LENS = R.lensPath(['user','state','name']);
    const CREATE_LENS = R.lensProp('create');
    const FLIP_MAP_LENS = R.lensPath(['view','flip_map']);
    const MOVE_MAP_LENS = R.lensPath(['view','move_map']);
    const DETAIL_LENS = R.lensPath(['view','detail']);
    const EDIT_LABEL_LENS = R.lensPath(['view','edit_label']);
    const TEMPLATES_LENS = R.lensProp('templates');
    const TEMPLATE_SELECTION_LENS = R.lensProp('template_selection');
    const TERRAINS_LENS = R.lensProp('terrains');
    const TERRAIN_SELECTION_LENS = R.lensProp('terrain_selection');
    const BOARD_LENS = R.lensProp('board');

    const game = appStateService.state
            .map(R.viewOr({}, GAME_LENS));
    const game_export = game
            .changes()
            .snapshot(gameExportCurrent, () => game_export_previous)
            .hold({});
    const game_export_previous = game_export.delay({});
    const loading = behavioursModel.signalModel.create();
    const create = appStateService.state
            .map(R.view(CREATE_LENS));

    const view = behavioursModel.signalModel.create();
    const scroll_left = view.filter(R.equals('scrollLeft'));
    const scroll_right = view.filter(R.equals('scrollRight'));
    const scroll_up = view.filter(R.equals('scrollUp'));
    const scroll_down = view.filter(R.equals('scrollDown'));
    const zoom_in = view.filter(R.equals('zoomIn'));
    const zoom_out = view.filter(R.equals('zoomOut'));
    const zoom_reset = view.filter(R.equals('zoomReset'));
    const toggle_menu = view.filter(R.equals('toggleMenu'));
    const move_map = appStateService.state
            .map(R.viewOr(false, MOVE_MAP_LENS)).changes();
    const flip_map = appStateService.state
            .map(R.viewOr(false, FLIP_MAP_LENS)).changes();
    const detail = appStateService.state
            .map(R.viewOr(null, DETAIL_LENS));
    const edit_label = appStateService.state
            .map(R.viewOr(null, EDIT_LABEL_LENS));

    const templates = game
            .map(R.viewOr(gameTemplatesModel.create(), TEMPLATES_LENS));
    const previous_templates = templates.delay();
    const template_selection = game
            .map(R.viewOr(gameTemplateSelectionModel.create(),
                          TEMPLATE_SELECTION_LENS));

    const templates_force_changes = behavioursModel.signalModel.create();
    const templates_changes = templates
            .changes()
            .snapshot(observeTemplatesChanges, previous_templates)
            .orElse(templates_force_changes)
            .snapshot((templates, stamps) => [templates, stamps], templates)
            .filter(([_templates_, stamps]) => !R.isEmpty(stamps));
    const template_selection_changes = template_selection
            .changes();
    const templates_flip_map = flip_map
            .snapshot(R.nthArg(0), templates);

    const terrains = game
            .map(R.viewOr(gameTerrainsModel.create(), TERRAINS_LENS));
    const previous_terrains = terrains.delay();
    const terrain_selection = game
            .map(R.viewOr(gameTerrainSelectionModel.create(),
                          TERRAIN_SELECTION_LENS));

    const terrains_force_changes = behavioursModel.signalModel.create();
    const terrains_changes = terrains
            .changes()
            .snapshot(observeTerrainsChanges, previous_terrains)
            .orElse(terrains_force_changes)
            .snapshot((terrains, stamps) => [terrains, stamps], terrains)
            .filter(([_terrains_, stamps]) => !R.isEmpty(stamps));
    const terrain_selection_changes = terrain_selection
            .changes();

    template_selection_changes
      .orElse(terrain_selection_changes)
      .listen(appGameCheckMode);

    const board_export = game
            .map(R.viewOr({}, BOARD_LENS))
            .changes()
            .orElse(terrains.changes())
            .snapshot(R.nthArg(0), game)
            .snapshot(gameBoardExport, () => board_export_previous)
            .hold({});
    const board_export_previous = board_export.delay({});

    const appGameService = {
      game, create, loading,
      export: { board: board_export,
                game: game_export
              },
      view: { scroll_left, scroll_right, scroll_up, scroll_down,
              zoom_in, zoom_out, zoom_reset,
              detail, edit_label, flip_map, move_map, toggle_menu
            },
      templates: { templates,
                   changes: templates_changes,
                   force_changes: templates_force_changes,
                   flip_map: templates_flip_map,
                   selection: template_selection,
                   selection_changes: template_selection_changes
                 },
      terrains: { terrains,
                  changes: terrains_changes,
                  force_changes: terrains_force_changes,
                  selection: terrain_selection,
                  selection_changes: terrain_selection_changes
                },
      saveCurrent: gameSaveCurrent,
      exportCurrent: gameExportCurrent,
      set: actionGameSet,
      load: actionGameLoad,
      loadDataReady: actionGameLoadDataReady,
      loadDataLoaded: actionGameLoadDataLoaded,
      loadGameLoaded: actionGameLoadGameLoaded,
      connectionClose: actionGameConnectionClose,
      commandExecute: actionGameCommandExecute,
      commandUndo: actionGameCommandUndo,
      commandUndoLast: actionGameCommandUndoLast,
      commandReplay: actionGameCommandReplay,
      commandReplayNext: actionGameCommandReplayNext,
      viewScrollLeft: actionGameViewScrollLeft,
      viewScrollRight: actionGameViewScrollRight,
      viewScrollUp: actionGameViewScrollUp,
      viewScrollDown: actionGameViewScrollDown,
      viewZoomIn: actionGameViewZoomIn,
      viewZoomOut: actionGameViewZoomOut,
      viewZoomReset: actionGameViewZoomReset,
      viewFlipMap: actionGameViewFlipMap,
      viewMoveMap: actionGameViewMoveMap,
      viewToggleMenu: actionGameViewToggleMenu,
      viewEditLabel: actionGameViewEditLabel,
      boardSet: actionGameBoardSet,
      boardSetRandom: actionGameBoardSetRandom,
      boardImportFile: actionGameBoardImportFile,
      boardExport: gameBoardExport,
      scenarioSet: actionGameScenarioSet,
      scenarioSetRandom: actionGameScenarioSetRandom,
      templateCreate: actionGameTemplateCreate,
      templatesSet: actionGameTemplatesSet,
      templatesSetDeviationMax: actionGameTemplatesSetDeviationMax,
      terrainCreate: actionGameTerrainCreate,
      terrainsSet: actionGameTerrainsSet,
      terrainsReset: actionGameTerrainsReset,
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
      // onScenarioRefresh: stateGameOnScenarioRefresh,
      // onScenarioGenerateObjectives: stateGameOnScenarioGenerateObjectives,
      // updateExport: stateGameUpdateExport,
      // updateBoardExport: stateGameUpdateBoardExport,
      // updateModelsExport: stateGameUpdateModelsExport,
      // checkMode: stateGameCheckMode,
      // closeOsd: stateGameCloseOsd
      checkMode: appGameCheckMode,
    };
    R.curryService(appGameService);

    mount();

    return appGameService;

    function mount() {
      appActionService
        // .register('Game.update'              , actionGameUpdate)
        .register('Game.set'                , actionGameSet)
        .register('Game.load'               , actionGameLoad)
        .register('Game.load.dataReady'     , actionGameLoadDataReady)
        .register('Game.load.dataLoaded'    , actionGameLoadDataLoaded)
        .register('Game.load.gameLoaded'    , actionGameLoadGameLoaded)
        .register('Game.connection.close'   , actionGameConnectionClose)
        .register('Game.command.execute'    , actionGameCommandExecute)
        .register('Game.command.undo'       , actionGameCommandUndo)
        .register('Game.command.replay'     , actionGameCommandReplay)
        .register('Game.command.undoLast'   , actionGameCommandUndoLast)
        .register('Game.command.replayNext' , actionGameCommandReplayNext)
        .register('Game.view.scrollLeft'    , actionGameViewScrollLeft)
        .register('Game.view.scrollRight'   , actionGameViewScrollRight)
        .register('Game.view.scrollUp'      , actionGameViewScrollUp)
        .register('Game.view.scrollDown'    , actionGameViewScrollDown)
        .register('Game.view.zoomIn'        , actionGameViewZoomIn)
        .register('Game.view.zoomOut'       , actionGameViewZoomOut)
        .register('Game.view.zoomReset'     , actionGameViewZoomReset)
        .register('Game.view.flipMap'       , actionGameViewFlipMap)
        .register('Game.view.moveMap'       , actionGameViewMoveMap)
        .register('Game.view.toggleMenu'    , actionGameViewToggleMenu)
        .register('Game.view.editLabel'     , actionGameViewEditLabel)
        .register('Game.board.set'          , actionGameBoardSet)
        .register('Game.board.setRandom'    , actionGameBoardSetRandom)
        .register('Game.board.importFile'   , actionGameBoardImportFile)
        .register('Game.scenario.set'       , actionGameScenarioSet)
        .register('Game.scenario.setRandom' , actionGameScenarioSetRandom)
        .register('Game.template.create'    , actionGameTemplateCreate)
        .register('Game.templates.set'      , actionGameTemplatesSet)
        .register('Game.templates.setDeviationMax',
                  actionGameTemplatesSetDeviationMax)
        .register('Game.terrain.create'     , actionGameTerrainCreate)
        .register('Game.terrains.set'       , actionGameTerrainsSet)
        .register('Game.terrains.reset'     , actionGameTerrainsReset)
        // .register('Game.command.replayBatch' , actionGameCommandReplayBatch)
        // .register('Game.invitePlayer'        , actionGameInvitePlayer)
        // .register('Game.setCmds'             , actionGameSetCmds)
        // .register('Game.setPlayers'          , actionGameSetPlayers)
        // .register('Game.newChatMsg'          , actionGameNewChatMsg)
        // .register('Game.uiState.flip'        , actionGameUiStateFlip)
        // .register('Game.scenario.generateObjectives',
        //             actionGameScenarioGenerateObjectives)
        // .register('Game.model.create'        , actionGameModelCreate)
        // .register('Game.model.copy'          , actionGameModelCopy)
        // .register('Game.model.importList'    , actionGameModelImportList)
        // .register('Game.model.importFile'    , actionGameModelImportFile)
        // .register('Game.model.importFileData', actionGameModelImportFileData)
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
    function gameExportCurrent(previous, game) {
      console.warn('Export Game', arguments);
      fileExportService.cleanup(previous.url);
      return {
        name: 'clicknfeat_game.json',
        url: fileExportService
          .generate('json', game)
      };
    }
    function gameSaveCurrent(state) {
      return R.thread(state)(
        R.unless(
          R.pipe(
            R.viewOr({}, GAME_LENS),
            R.prop('local_stamp'),
            R.isNil
          ),
          appGamesService.localUpdate$(R.__, state.game)
        )
      );
    }
    function actionGameSet(state, game) {
      return R.thread(state)(
        R.set(GAME_LENS, game),
        gameSaveCurrent
      );
    }
    function actionGameLoad(_state_, is_online, is_private, id) {
      return waitForDataReady().then(() => {
        return appActionService
          .do('Game.load.dataReady', is_online, is_private, id);
      });

      function waitForDataReady() {
        return R.allP([
          appDataService.ready,
          appUserService.ready,
          appGamesService.ready
        ]);
      }
    }
    function actionGameLoadDataReady(state, is_online, is_private, id) {
      return R.threadP()(
        R.ifElse(
          () => is_online,
          () => gamesModel.loadOnlineGameP(is_private, id),
          () => gamesModel.loadLocalGameP(id, state.local_games)
        ),
        (data) => appActionService
          .do('Game.load.dataLoaded', data)
      );
    }
    function actionGameLoadDataLoaded(state, data) {
      loading.send(true);
      R.threadP(data)(
        gameModel.loadP,
        (game) => appActionService
          .do('Game.load.gameLoaded', game)
      );
      return R.thread(state)(
        appModesService.reset,
        gameSaveCurrent
      );
    }
    function actionGameLoadGameLoaded(state, game) {
      loading.send(false);
      const user = R.view(USER_NAME_LENS, state);
      return R.threadP(game)(
        R.when(
          gameModel.isOnline,
          gameConnectionModel.openP$(user)
        ),
        (game) => appActionService
          .do('Game.set', game)
      );
    }
    function actionGameConnectionClose(state) {
      return R.thread(state)(
        R.over(GAME_LENS, gameConnectionModel.cleanup),
        gameSaveCurrent
      );
    }
    function actionGameCommandExecute(state, cmd, args) {
      const user_name = R.view(USER_NAME_LENS, state);
      return R.threadP(state.game)(
        gameModel.executeCommandP$(cmd, args, user_name),
        (game) => appActionService.do('Game.set', game)
      ).catch(appErrorService.emit);
    }
    function actionGameCommandUndo(state, cmd) {
      return R.threadP(state.game)(
        gameModel.undoCommandP$(cmd),
        (game) => appActionService.do('Game.set', game)
      ).catch(appErrorService.emit);
    }
    function actionGameCommandUndoLast(state) {
      return R.threadP(state.game)(
        gameModel.undoLastCommandP,
        (game) => appActionService.do('Game.set', game)
      ).catch(appErrorService.emit);
    }
    function actionGameCommandReplay(state, cmd) {
      return R.threadP(state.game)(
        gameModel.replayCommandP$(cmd),
        (game) => appActionService.do('Game.set', game)
      ).catch(appErrorService.emit);
    }
    function actionGameCommandReplayNext(state) {
      return R.threadP(state.game)(
        gameModel.replayNextCommandP,
        (game) => appActionService.do('Game.set', game)
      ).catch(appErrorService.emit);
    }
    function actionGameViewScrollLeft() {
      view.send('scrollLeft');
    }
    function actionGameViewScrollRight() {
      view.send('scrollRight');
    }
    function actionGameViewScrollUp() {
      view.send('scrollUp');
    }
    function actionGameViewScrollDown() {
      view.send('scrollDown');
    }
    function actionGameViewZoomIn() {
      view.send('zoomIn');
    }
    function actionGameViewZoomOut() {
      view.send('zoomOut');
    }
    function actionGameViewZoomReset() {
      view.send('zoomReset');
    }
    function actionGameViewFlipMap(state) {
      return R.over(FLIP_MAP_LENS, R.not, state);
    }
    function actionGameViewMoveMap(state, set) {
      return R.set(MOVE_MAP_LENS, set, state);
    }
    function actionGameViewToggleMenu() {
      view.send('toggleMenu');
    }
    function actionGameViewEditLabel(state, new_label) {
      const edit_label = R.view(EDIT_LABEL_LENS, state);
      appActionService
        .defer('Game.command.execute',
               `on${s.capitalize(edit_label.type)}s`, [
                 'addLabel',
                 [new_label],
                 [edit_label.element.state.stamp]
               ]);
      return R.set(EDIT_LABEL_LENS, null, state);
    }
    function actionGameBoardSet(state, name) {
      const board = gameBoardModel.forName(name, state.boards);
      return appStateService
        .onAction(state, [ 'Game.command.execute',
                           'setBoard', [board] ]);
    }
    function actionGameBoardSetRandom(state) {
      let board, name = gameBoardModel.name(state.game.board);
      while(name === gameBoardModel.name(state.game.board)) {
        board = state.boards[R.randomRange(0, state.boards.length-1)];
        name = gameBoardModel.name(board);
      }
      return appStateService
        .onAction(state, [ 'Game.command.execute',
                           'setBoard', [board] ]);
    }
    function actionGameBoardImportFile(_state_, file) {
      return R.threadP(file)(
        fileImportService.readP$('json'),
        (data) => appActionService
          .do('Game.command.execute', 'setBoardData', [data])
      ).catch(appErrorService.emit);
    }
    function gameBoardExport(previous, game) {
      fileExportService.cleanup(previous.url);
      const data = {
        board: R.view(BOARD_LENS, game),
        terrain: {
          base: { x: 0, y: 0, r: 0 },
          terrains: R.thread(game)(
            R.viewOr(gameTerrainsModel.create(), TERRAINS_LENS),
            gameTerrainsModel.copyAll
          )
        }
      };
      console.warn('Export board', arguments, data);
      return {
        name: 'clicknfeat_board.json',
        url: fileExportService.generate('json', data)
      };
    }
    function actionGameScenarioSet(state, name, group) {
      const scenario = gameScenarioModel.forName(name, group);
      return appStateService
        .onAction(state, [ 'Game.command.execute',
                           'setScenario', [scenario] ]);
    }
    function actionGameScenarioSetRandom(state) {
      const group = gameScenarioModel.group('SR15', state.scenarios);
      let scenario, name = gameScenarioModel.name(state.game.scenario);
      while(name === gameScenarioModel.name(state.game.scenario)) {
        scenario = group[1][R.randomRange(0, group[1].length-1)];
        name = gameScenarioModel.name(scenario);
      }
      return appStateService
        .onAction(state, [ 'Game.command.execute',
                           'setScenario', [scenario] ]);
    }
    function actionGameTemplateCreate(state, type) {
      return R.thread(state)(
        R.set(CREATE_LENS, {
          base: { x: 240, y: 240, r: 0 },
          templates: [ { type: type, x: 0, y: 0, r: 0 } ]
        }),
        appStateService.onAction$(R.__, ['Modes.switchTo', 'CreateTemplate'])
      );
    }
    function actionGameTemplatesSet(state, templates) {
      return R.over(
        GAME_LENS,
        R.set(TEMPLATES_LENS, templates),
        state);
    }
    function actionGameTemplatesSetDeviationMax(state, stamps, max) {
      return R.threadP(state)(
        R.viewOr({}, GAME_LENS),
        R.viewOr({}, TEMPLATES_LENS),
        gameTemplatesModel.onStampsP$('setMaxDeviation', [max], stamps),
        (templates) => appActionService
          .do('Game.templates.set', templates)
      );
    }
    function actionGameTerrainCreate(state, path) {
      return R.thread(state)(
        R.set(CREATE_LENS, {
          base: { x: 240, y: 240, r: 0 },
          terrains: [ { info: path, x: 0, y: 0, r: 0 } ],
          infos: state.terrains
        }),
        appStateService.onAction$(R.__, ['Modes.switchTo', 'CreateTerrain'])
      );
    }
    function actionGameTerrainsSet(state, terrains) {
      return R.over(
        GAME_LENS,
        R.set(TERRAINS_LENS, terrains),
        state);
    }
    function actionGameTerrainsReset(state) {
      return R.thread(state)(
        R.view(GAME_LENS),
        R.view(TERRAINS_LENS),
        gameTerrainsModel.all,
        R.pluck('state'),
        R.pluck('stamp'),
        (stamps) => appStateService
          .onAction(state, [ 'Game.command.execute',
                             'deleteTerrain', [stamps]
                           ])
      );
    }
    // function stateGameOnCommandReplayBatch(state, _event_, [cmds]) {
    //   return R.threadP(state.game)(
    //     gameModel.replayCommandsBatchP$(cmds),
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
    function appGameCheckMode() {
      const game = appGameService.game.sample();
      const modes = appModesService.modes.sample();
      const current_mode = modesModel.currentModeName(modes);
      const mode = R.thread()(
        () => gameTerrainSelectionModel
          .checkMode(R.viewOr({}, TERRAIN_SELECTION_LENS, game)),
        R.unless(
          R.exists,
          () => gameTemplateSelectionModel
          .checkMode(R.viewOr({}, TEMPLATES_LENS, game),
                     R.viewOr({}, TEMPLATE_SELECTION_LENS, game))
        ),
        // R.unless(
        //   R.exists,
        //   () => gameModelSelectionModel
        //     .checkMode(game.models, R.propOr({}, 'model_selection', game))
        // )
        R.defaultTo('Default')
      );
      console.warn('CheckMode', mode);
      if(R.exists(mode) &&
         mode !== current_mode) {
        appActionService.defer('Modes.switchTo', mode);
      }
    }
    function observeTemplatesChanges(olds, news) {
      return R.thread(gameTemplatesModel.all(news))(
        R.symmetricDifference(gameTemplatesModel.all(olds)),
        R.map(R.path(['state','stamp'])),
        R.uniq
      );
    }
    function observeTerrainsChanges(olds, news) {
      return R.thread(gameTerrainsModel.all(news))(
        R.symmetricDifference(gameTerrainsModel.all(olds)),
        R.map(R.path(['state','stamp'])),
        R.uniq
      );
    }
  }
})();
