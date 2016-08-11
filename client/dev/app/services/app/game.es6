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
    'commands',
    'fileImport',
    'fileExport',
    'game',
    'gameBoard',
    'gameConnection',
    'gameFactions',
    'gameScenario',
    'gameLos',
    'gameModels',
    'gameModelSelection',
    'gameRuler',
    'gameTemplates',
    'gameTemplateSelection',
    'gameTerrains',
    'gameTerrainSelection',
    'games',
    'modes',
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
                                 commandsModel,
                                 fileImportService,
                                 fileExportService,
                                 gameModel,
                                 gameBoardModel,
                                 gameConnectionModel,
                                 gameFactionsModel,
                                 gameScenarioModel,
                                 gameLosModel,
                                 gameModelsModel,
                                 gameModelSelectionModel,
                                 gameRulerModel,
                                 gameTemplatesModel,
                                 gameTemplateSelectionModel,
                                 gameTerrainsModel,
                                 gameTerrainSelectionModel,
                                 gamesModel,
                                 modesModel) {
    const GAME_LENS = R.lensProp('game');
    const USER_NAME_LENS = R.lensPath(['user','state','name']);
    const CREATE_LENS = R.lensProp('create');
    const CHAT_LENS = R.lensProp('chat');
    const COMMANDS_LENS = R.lensProp('commands');
    const UNDO_LENS = R.lensProp('undo');
    const UNDO_LOG_LENS = R.lensProp('undo_log');
    const DRAG_BOX_LENS = R.lensPath(['view','drag_box']);
    const FLIP_MAP_LENS = R.lensPath(['view','flip_map']);
    const MOVE_MAP_LENS = R.lensPath(['view','move_map']);
    const DETAIL_LENS = R.lensPath(['view','detail']);
    const EDIT_DAMAGE_LENS = R.lensPath(['view','edit_damage']);
    const EDIT_LABEL_LENS = R.lensPath(['view','edit_label']);
    const MODELS_LENS = R.lensProp('models');
    const MODEL_SELECTION_LENS = R.lensProp('model_selection');
    const TEMPLATES_LENS = R.lensProp('templates');
    const TEMPLATE_SELECTION_LENS = R.lensProp('template_selection');
    const TERRAINS_LENS = R.lensProp('terrains');
    const TERRAIN_SELECTION_LENS = R.lensProp('terrain_selection');
    const BOARD_LENS = R.lensProp('board');
    const LOS_LENS = R.lensProp('los');
    const RULER_LENS = R.lensProp('ruler');

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

    const chat = game.map(R.viewOr([], CHAT_LENS));
    const previous_chat = chat.delay([]);
    const new_chat = chat
            .map(R.last)
            .changes()
            .map(R.of)
            .snapshot(R.prepend, appUserService.user)
            .snapshot(R.prepend, chat)
            .snapshot(R.prepend, previous_chat)
            .filter(gameCheckNewChat);

    const dice = game
            .map(R.viewOr([], COMMANDS_LENS))
            .map(R.filter(commandsModel.isDice));
    const previous_dice = dice.delay([]);
    const bad_dice = dice
            .map(R.last)
            .changes()
            .map(R.of)
            .snapshot(R.prepend, dice)
            .snapshot(R.prepend, previous_dice)
            .filter(gameCheckBadDice);
    const undo = game
            .map(R.viewOr([], UNDO_LENS));
    const undo_log = game
            .map(R.viewOr([], UNDO_LOG_LENS));

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
    const drag_box = appStateService.state
            .map(R.viewOr({}, DRAG_BOX_LENS)).changes();
    const flip_map = appStateService.state
            .map(R.viewOr(false, FLIP_MAP_LENS));
    const flip_map_changes = flip_map.changes();
    const detail = appStateService.state
            .map(R.viewOr(null, DETAIL_LENS));
    const edit_damage = appStateService.state
            .map(R.viewOr(null, EDIT_DAMAGE_LENS));
    const edit_damage_changes = edit_damage.changes();
    const edit_label = appStateService.state
            .map(R.viewOr(null, EDIT_LABEL_LENS));
    const edit_label_changes = edit_label.changes();

    const models = game
            .map(R.viewOr(gameModelsModel.create(), MODELS_LENS));
    const previous_models = models.delay();
    const model_selection = game
            .map(R.viewOr(gameModelSelectionModel.create(),
                          MODEL_SELECTION_LENS));
    const previous_model_selection = model_selection.delay();

    const models_force_changes = behavioursModel.signalModel.create();
    const models_changes = models
            .changes()
            .snapshot(observeModelsChanges, previous_models)
            .orElse(models_force_changes)
            .snapshot((models, stamps) => [models, stamps], models)
            .filter(([_models_, stamps]) => !R.isEmpty(stamps));
    const model_selection_changes = model_selection
            .changes()
            .snapshot(observeModelSelectionChanges, previous_model_selection)
            .snapshot((sel, stamps) => [sel, stamps], model_selection)
            .filter(([_sel_, stamps]) => !R.isEmpty(stamps));
    const models_flip_map = flip_map_changes
            .snapshot(R.nthArg(0), models);

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
    const templates_flip_map = flip_map_changes
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

    const los = game
            .map(R.viewOr(gameLosModel.create(), LOS_LENS));
    const los_changes = los
            .changes()
            .snapshot((models, los) => [models, los], models)
            .snapshot(R.prepend, appModesService.modes);
    const ruler = game
            .map(R.viewOr(gameRulerModel.create(), RULER_LENS));
    const ruler_changes = ruler
            .changes()
            .snapshot((flip, ruler) => [flip, ruler], flip_map)
            .orElse(flip_map_changes.snapshot((ruler, flip) => [flip, ruler], ruler))
            .snapshot(R.prepend, models)
            .snapshot(R.prepend, appModesService.modes);

    appModesService.modes
      .changes().filter((modes) => 'Default' === modesModel.currentModeName(modes))
      .orElse(model_selection_changes)
      .orElse(template_selection_changes)
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
    const model_selection_export = model_selection_changes
            .snapshot(R.nthArg(0), game)
            .snapshot(gameModelSelectionExport, () => model_selection_export_previous)
            .hold({});
    const model_selection_export_previous = model_selection_export.delay({});

    const appGameService = {
      game, create, dice, bad_dice, loading,
      chat: { chat, new_chat },
      commands: { undo, undo_log },
      export: { board: board_export,
                game: game_export,
                models: model_selection_export
              },
      view: { scroll_left, scroll_right, scroll_up, scroll_down,
              zoom_in, zoom_out, zoom_reset,
              detail: detail.changes(), drag_box,
              flip_map: flip_map_changes, move_map, toggle_menu,
              edit_damage, edit_damage_changes,
              edit_label, edit_label_changes
            },
      models: { models,
                changes: models_changes,
                force_changes: models_force_changes,
                flip_map: models_flip_map,
                selection: model_selection,
                selection_changes: model_selection_changes
              },
      los: { los,
             changes: los_changes
           },
      ruler: { ruler,
               changes: ruler_changes
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
      connectionBatchCmd: actionGameConnectionBatchCmd,
      connectionChat: actionGameConnectionChat,
      connectionReplayCmd: actionGameConnectionReplayCmd,
      connectionSendChat: actionGameConnectionSendChat,
      connectionSetCmds: actionGameConnectionSetCmds,
      connectionSetPlayers: actionGameConnectionSetPlayers,
      connectionUndoCmd: actionGameConnectionUndoCmd,
      invitePlayer: actionGameInvitePlayer,
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
      viewEditDamageReset: actionGameViewEditDamageReset,
      viewEditLabel: actionGameViewEditLabel,
      boardSet: actionGameBoardSet,
      boardSetRandom: actionGameBoardSetRandom,
      boardImportFile: actionGameBoardImportFile,
      boardExport: gameBoardExport,
      scenarioSet: actionGameScenarioSet,
      scenarioSetRandom: actionGameScenarioSetRandom,
      scenarioGenerateObjectives: actionGameScenarioGenerateObjectives,
      modelCreate: actionGameModelCreate,
      modelCopy: actionGameModelCopy,
      modelImportList: actionGameModelImportList,
      modelImportFile: actionGameModelImportFile,
      modelSelectionExport: gameModelSelectionExport,
      templateCreate: actionGameTemplateCreate,
      templatesSet: actionGameTemplatesSet,
      templatesSetDeviationMax: actionGameTemplatesSetDeviationMax,
      terrainCreate: actionGameTerrainCreate,
      terrainsSet: actionGameTerrainsSet,
      terrainsReset: actionGameTerrainsReset,
      // onScenarioRefresh: stateGameOnScenarioRefresh,
      checkMode: appGameCheckMode
    };
    R.curryService(appGameService);

    mount();

    return appGameService;

    function mount() {
      appActionService
        .register('Game.set'                   , actionGameSet)
        .register('Game.load'                  , actionGameLoad)
        .register('Game.load.dataReady'        , actionGameLoadDataReady)
        .register('Game.load.dataLoaded'       , actionGameLoadDataLoaded)
        .register('Game.load.gameLoaded'       , actionGameLoadGameLoaded)
        .register('Game.connection.batchCmd'   , actionGameConnectionBatchCmd)
        .register('Game.connection.chat'       , actionGameConnectionChat)
        .register('Game.connection.replayCmd'  , actionGameConnectionReplayCmd)
        .register('Game.connection.sendChat'   , actionGameConnectionSendChat)
        .register('Game.connection.setCmds'    , actionGameConnectionSetCmds)
        .register('Game.connection.setPlayers' , actionGameConnectionSetPlayers)
        .register('Game.connection.undoCmd'    , actionGameConnectionUndoCmd)
        .register('Game.invitePlayer'          , actionGameInvitePlayer)
        .register('Game.connection.close'      , actionGameConnectionClose)
        .register('Game.command.execute'       , actionGameCommandExecute)
        .register('Game.command.replay'        , actionGameCommandReplay)
        .register('Game.command.replayNext'    , actionGameCommandReplayNext)
        .register('Game.command.undo'          , actionGameCommandUndo)
        .register('Game.command.undoLast'      , actionGameCommandUndoLast)
        .register('Game.view.scrollLeft'       , actionGameViewScrollLeft)
        .register('Game.view.scrollRight'      , actionGameViewScrollRight)
        .register('Game.view.scrollUp'         , actionGameViewScrollUp)
        .register('Game.view.scrollDown'       , actionGameViewScrollDown)
        .register('Game.view.zoomIn'           , actionGameViewZoomIn)
        .register('Game.view.zoomOut'          , actionGameViewZoomOut)
        .register('Game.view.zoomReset'        , actionGameViewZoomReset)
        .register('Game.view.flipMap'          , actionGameViewFlipMap)
        .register('Game.view.moveMap'          , actionGameViewMoveMap)
        .register('Game.view.toggleMenu'       , actionGameViewToggleMenu)
        .register('Game.view.editDamage.reset' , actionGameViewEditDamageReset)
        .register('Game.view.editLabel'        , actionGameViewEditLabel)
        .register('Game.board.set'             , actionGameBoardSet)
        .register('Game.board.setRandom'       , actionGameBoardSetRandom)
        .register('Game.board.importFile'      , actionGameBoardImportFile)
        .register('Game.scenario.set'          , actionGameScenarioSet)
        .register('Game.scenario.setRandom'    , actionGameScenarioSetRandom)
        .register('Game.scenario.generateObjectives',
                  actionGameScenarioGenerateObjectives)
        .register('Game.model.create'          , actionGameModelCreate)
        .register('Game.model.copy'            , actionGameModelCopy)
        .register('Game.model.importList'      , actionGameModelImportList)
        .register('Game.model.importFile'      , actionGameModelImportFile)
        .register('Game.template.create'       , actionGameTemplateCreate)
        .register('Game.templates.set'         , actionGameTemplatesSet)
        .register('Game.templates.setDeviationMax',
                  actionGameTemplatesSetDeviationMax)
        .register('Game.terrain.create'        , actionGameTerrainCreate)
        .register('Game.terrains.set'          , actionGameTerrainsSet)
        .register('Game.terrains.reset'        , actionGameTerrainsReset);
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
    function actionGameLoad(state, is_online, is_private, id) {
      waitForDataReady().then(() => {
        return appActionService
          .do('Game.load.dataReady', is_online, is_private, id);
      });
      return R.over(
        GAME_LENS,
        R.pipe(R.defaultTo({}), gameModel.close),
        state
      );

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
      ).catch(appErrorService.emit);
    }
    function actionGameLoadDataLoaded(state, data) {
      loading.send(true);
      R.threadP(data)(
        gameModel.loadP,
        (game) => appActionService
          .do('Game.load.gameLoaded', game)
      ).catch(appErrorService.emit);
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
      ).catch(appErrorService.emit);
    }
    function actionGameConnectionBatchCmd(state, msg) {
      return R.threadP(state)(
        R.view(GAME_LENS),
        gameModel.replayCommandsBatchP$(msg.cmds),
        (game) => {
          appActionService
            .do('Game.set', game);
        }
      ).catch(appErrorService.emit);
    }
    function actionGameConnectionChat(state, msg) {
      return R.over(
        GAME_LENS,
        R.over(CHAT_LENS, R.compose(R.append(msg.chat), R.defaultTo([]))),
        state
      );
    }
    function actionGameConnectionReplayCmd(state, msg) {
      return appStateService
        .onAction(state, ['Game.command.replay', msg.cmd]);
    }
    function actionGameConnectionSendChat(state, msg) {
      const user_name = R.viewOr('Unknown', USER_NAME_LENS, state);
      return R.over(
        GAME_LENS,
        gameModel.sendChat$(user_name, msg),
        state
      );
    }
    function actionGameConnectionSetCmds(state, set) {
      return R.over(
        GAME_LENS,
        R.assoc(set.where, set.cmds),
        state
      );
    }
    function actionGameConnectionSetPlayers(state, msg) {
      return R.over(
        GAME_LENS,
        R.assoc('players', msg.players),
        state
      );
    }
    function actionGameConnectionUndoCmd(state, msg) {
      return appStateService
        .onAction(state, ['Game.command.undo', msg.cmd]);
    }
    function actionGameInvitePlayer(state, to) {
      const user_name = s.capitalize(R.viewOr('Unknown', USER_NAME_LENS, state));
      const msg = `${user_name} has invited you to join a game`;
      const link = self.window.location.hash;
      console.warn('Invite player', to, msg, link);

      return appStateService
        .onAction(state, [ 'User.sendChat',
                           { to: [to], msg: msg, link: link } ]);
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
    function actionGameViewEditDamageReset(state) {
      return R.set(EDIT_DAMAGE_LENS, {}, state);
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
      return R.set(EDIT_LABEL_LENS, {}, state);
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
      const group = gameScenarioModel.group('SR16', state.scenarios);
      let scenario, name = gameScenarioModel.name(state.game.scenario);
      while(name === gameScenarioModel.name(state.game.scenario)) {
        scenario = group[1][R.randomRange(0, group[1].length-1)];
        name = gameScenarioModel.name(scenario);
      }
      return appStateService
        .onAction(state, [ 'Game.command.execute',
                           'setScenario', [scenario] ]);
    }
    function actionGameScenarioGenerateObjectives(state) {
      return appStateService.onAction(state, [
        'Game.command.execute',
        'createObjectives',
        []
      ]);
    }
    function actionGameModelCreate(state, model_path, repeat) {
      return R.thread(state)(
        R.set(CREATE_LENS, {
          base: { x: 240, y: 240, r: 0 },
          models: R.times((i) => ({
            info: model_path,
            x: 20*i, y: 0, r: 0
          }), R.defaultTo(1, repeat))
        }),
        appStateService.onAction$(R.__, ['Modes.switchTo', 'CreateModel'])
      );
    }
    function actionGameModelCopy(state, create) {
      return R.thread(state)(
        R.set(CREATE_LENS, create),
        appStateService.onAction$(R.__, ['Modes.switchTo', 'CreateModel'])
      );
    }
    function actionGameModelImportList(state, list) {
      const user = R.viewOr('Unknown', USER_NAME_LENS, state);
      return R.thread(state)(
        R.set(
          CREATE_LENS,
          gameFactionsModel.buildModelsList(list, user, state.factions)
        ),
        appStateService.onAction$(R.__, ['Modes.switchTo', 'CreateModel'])
      );
    }
    function actionGameModelImportFile(_state_, file) {
      return R.threadP(file)(
        fileImportService.readP$('json'),
        (create) => appActionService
          .do('Game.model.copy', create)
      ).catch(appErrorService.emit);
    }
    function gameModelSelectionExport(previous, game) {
      fileExportService.cleanup(previous.url);
      const data = R.thread(game)(
        R.view(MODEL_SELECTION_LENS),
        gameModelSelectionModel.get$('local'),
        R.ifElse(
          R.isEmpty,
          () => null,
          gameModelsModel.copyStamps$(R.__, R.view(MODELS_LENS, game))
        )
      );
      console.warn('Export models', arguments, data);
      return {
        name: 'clicknfeat_models.json',
        url: data ? fileExportService.generate('json', data) : null
      };
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
        R.unless(
          R.exists,
          () => gameModelSelectionModel
            .checkMode(R.viewOr({}, MODELS_LENS, game),
                       R.viewOr({}, MODEL_SELECTION_LENS, game))
        ),
        R.defaultTo('Default')
      );
      console.warn('CheckMode', mode);
      if(R.exists(mode) &&
         mode !== current_mode) {
        appActionService.defer('Modes.switchTo', mode);
      }
    }
    function observeModelsChanges(olds, news) {
      return R.thread(gameModelsModel.all(news))(
        R.symmetricDifference(gameModelsModel.all(olds)),
        R.map(R.path(['state','stamp'])),
        R.uniq
      );
    }
    function observeModelSelectionChanges(old, sel) {
      return R.concat(
        R.symmetricDifference(R.propOr([], 'local', old), R.propOr([], 'local', sel)),
        R.symmetricDifference(R.propOr([], 'remote', old), R.propOr([], 'remote', sel)),
        R.uniq
      );
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
    function gameCheckNewChat([previous_chat, chat, user, last]) {
      return ( R.exists(last) &&
               !gameModel.chatIsFrom(user, last) &&
               R.length(previous_chat)+1 === R.length(chat)
             );
    }
    function gameCheckBadDice([previous_dice, dice, last]) {
      if(last.type === 'rollDeviation') return null;
      if(R.length(previous_dice)+1 !== R.length(dice)) return null;
      const d = R.propOr([], 'd', last);
      if(R.length(d) < 2) return null;
      const mean = R.reduce(R.add, 0, d) / R.length(d);
      return (mean < 2) ? true : null;
    }
  }
})();
