'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.services').factory('appGame', stateGameModelFactory);

  stateGameModelFactory.$inject = ['behaviours', 'appAction', 'appData', 'appError', 'appGames', 'appModes', 'appState', 'appUser', 'commands', 'fileImport', 'fileExport', 'game', 'gameBoard', 'gameConnection', 'gameFactions', 'gameScenario', 'gameLos', 'gameModels', 'gameModelSelection', 'gameRuler', 'gameTemplates', 'gameTemplateSelection', 'gameTerrains', 'gameTerrainSelection', 'games', 'modes', 'allTemplates'];
  function stateGameModelFactory(behavioursModel, appActionService, appDataService, appErrorService, appGamesService, appModesService, appStateService, appUserService, commandsModel, fileImportService, fileExportService, gameModel, gameBoardModel, gameConnectionModel, gameFactionsModel, gameScenarioModel, gameLosModel, gameModelsModel, gameModelSelectionModel, gameRulerModel, gameTemplatesModel, gameTemplateSelectionModel, gameTerrainsModel, gameTerrainSelectionModel, gamesModel, modesModel) {
    var GAME_LENS = R.lensProp('game');
    var USER_NAME_LENS = R.lensPath(['user', 'state', 'name']);
    var CREATE_LENS = R.lensProp('create');
    var CHAT_LENS = R.lensProp('chat');
    var COMMANDS_LENS = R.lensProp('commands');
    var UNDO_LENS = R.lensProp('undo');
    var UNDO_LOG_LENS = R.lensProp('undo_log');
    var DRAG_BOX_LENS = R.lensPath(['view', 'drag_box']);
    var FLIP_MAP_LENS = R.lensPath(['view', 'flip_map']);
    var MOVE_MAP_LENS = R.lensPath(['view', 'move_map']);
    var DETAIL_LENS = R.lensPath(['view', 'detail']);
    var EDIT_DAMAGE_LENS = R.lensPath(['view', 'edit_damage']);
    var EDIT_LABEL_LENS = R.lensPath(['view', 'edit_label']);
    var MODELS_LENS = R.lensProp('models');
    var MODEL_SELECTION_LENS = R.lensProp('model_selection');
    var TEMPLATES_LENS = R.lensProp('templates');
    var TEMPLATE_SELECTION_LENS = R.lensProp('template_selection');
    var TERRAINS_LENS = R.lensProp('terrains');
    var TERRAIN_SELECTION_LENS = R.lensProp('terrain_selection');
    var BOARD_LENS = R.lensProp('board');
    var LOS_LENS = R.lensProp('los');
    var RULER_LENS = R.lensProp('ruler');

    var game = appStateService.state.map(R.viewOr({}, GAME_LENS));
    var game_export = game.changes().map(gameExportCurrent).hold({});
    var loading = behavioursModel.signalModel.create();
    var create = appStateService.state.map(R.view(CREATE_LENS));

    var chat = game.map(R.viewOr([], CHAT_LENS));
    var previous_chat = chat.delay([]);
    var new_chat = chat.map(R.last).changes().map(R.of).snapshot(R.prepend, appUserService.user).snapshot(R.prepend, chat).snapshot(R.prepend, previous_chat).filter(gameCheckNewChat);

    var dice = game.map(R.viewOr([], COMMANDS_LENS)).map(R.filter(commandsModel.isDice));
    var previous_dice = dice.delay([]);
    var bad_dice = dice.map(R.last).changes().map(R.of).snapshot(R.prepend, dice).snapshot(R.prepend, previous_dice).filter(gameCheckBadDice);
    var undo = game.map(R.viewOr([], UNDO_LENS));
    var undo_log = game.map(R.viewOr([], UNDO_LOG_LENS));

    var view = behavioursModel.signalModel.create();
    var scroll_left = view.filter(R.equals('scrollLeft'));
    var scroll_right = view.filter(R.equals('scrollRight'));
    var scroll_up = view.filter(R.equals('scrollUp'));
    var scroll_down = view.filter(R.equals('scrollDown'));
    var zoom_in = view.filter(R.equals('zoomIn'));
    var zoom_out = view.filter(R.equals('zoomOut'));
    var zoom_reset = view.filter(R.equals('zoomReset'));
    var toggle_menu = view.filter(R.equals('toggleMenu'));
    var move_map = appStateService.state.map(R.viewOr(false, MOVE_MAP_LENS)).changes();
    var drag_box = appStateService.state.map(R.viewOr({}, DRAG_BOX_LENS)).changes();
    var flip_map = appStateService.state.map(R.viewOr(false, FLIP_MAP_LENS));
    var flip_map_changes = flip_map.changes();
    var detail = appStateService.state.map(R.viewOr(null, DETAIL_LENS));
    var edit_damage = appStateService.state.map(R.viewOr(null, EDIT_DAMAGE_LENS));
    var edit_damage_changes = edit_damage.changes();
    var edit_label = appStateService.state.map(R.viewOr(null, EDIT_LABEL_LENS));
    var edit_label_changes = edit_label.changes();

    var models = game.map(R.viewOr(gameModelsModel.create(), MODELS_LENS));
    var previous_models = models.delay();
    var model_selection = game.map(R.viewOr(gameModelSelectionModel.create(), MODEL_SELECTION_LENS));
    var previous_model_selection = model_selection.delay();

    var models_force_changes = behavioursModel.signalModel.create();
    var models_changes = models.changes().snapshot(observeModelsChanges, previous_models).orElse(models_force_changes).snapshot(function (models, stamps) {
      return [models, stamps];
    }, models).filter(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var _models_ = _ref2[0];
      var stamps = _ref2[1];
      return !R.isEmpty(stamps);
    });
    var model_selection_changes = model_selection.changes().snapshot(observeModelSelectionChanges, previous_model_selection).snapshot(function (sel, stamps) {
      return [sel, stamps];
    }, model_selection).filter(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2);

      var _sel_ = _ref4[0];
      var stamps = _ref4[1];
      return !R.isEmpty(stamps);
    });
    var models_flip_map = flip_map_changes.snapshot(R.nthArg(0), models);

    var templates = game.map(R.viewOr(gameTemplatesModel.create(), TEMPLATES_LENS));
    var previous_templates = templates.delay();
    var template_selection = game.map(R.viewOr(gameTemplateSelectionModel.create(), TEMPLATE_SELECTION_LENS));

    var templates_force_changes = behavioursModel.signalModel.create();
    var templates_changes = templates.changes().snapshot(observeTemplatesChanges, previous_templates).orElse(templates_force_changes).snapshot(function (templates, stamps) {
      return [templates, stamps];
    }, templates).filter(function (_ref5) {
      var _ref6 = _slicedToArray(_ref5, 2);

      var _templates_ = _ref6[0];
      var stamps = _ref6[1];
      return !R.isEmpty(stamps);
    });
    var template_selection_changes = template_selection.changes();
    var templates_flip_map = flip_map_changes.snapshot(R.nthArg(0), templates);

    var terrains = game.map(R.viewOr(gameTerrainsModel.create(), TERRAINS_LENS));
    var previous_terrains = terrains.delay();
    var terrain_selection = game.map(R.viewOr(gameTerrainSelectionModel.create(), TERRAIN_SELECTION_LENS));

    var terrains_force_changes = behavioursModel.signalModel.create();
    var terrains_changes = terrains.changes().snapshot(observeTerrainsChanges, previous_terrains).orElse(terrains_force_changes).snapshot(function (terrains, stamps) {
      return [terrains, stamps];
    }, terrains).filter(function (_ref7) {
      var _ref8 = _slicedToArray(_ref7, 2);

      var _terrains_ = _ref8[0];
      var stamps = _ref8[1];
      return !R.isEmpty(stamps);
    });
    var terrain_selection_changes = terrain_selection.changes();

    var los = game.map(R.viewOr(gameLosModel.create(), LOS_LENS));
    var los_changes = los.changes().snapshot(function (models, los) {
      return [models, los];
    }, models).snapshot(R.prepend, appModesService.modes);
    var ruler = game.map(R.viewOr(gameRulerModel.create(), RULER_LENS));
    var ruler_changes = ruler.changes().snapshot(function (flip, ruler) {
      return [flip, ruler];
    }, flip_map).orElse(flip_map_changes.snapshot(function (ruler, flip) {
      return [flip, ruler];
    }, ruler)).snapshot(R.prepend, models).snapshot(R.prepend, appModesService.modes);

    appModesService.modes.changes().filter(function (modes) {
      return 'Default' === modesModel.currentModeName(modes);
    }).orElse(model_selection_changes).orElse(template_selection_changes).orElse(terrain_selection_changes).listen(appGameCheckMode);

    var board_export = game.map(R.viewOr({}, BOARD_LENS)).changes().orElse(terrains.changes()).snapshot(R.nthArg(0), game).snapshot(gameBoardExport, function () {
      return board_export_previous;
    }).hold({});
    var board_export_previous = board_export.delay({});
    var model_selection_export = model_selection_changes.snapshot(R.nthArg(0), game).snapshot(gameModelSelectionExport, function () {
      return model_selection_export_previous;
    }).hold({});
    var model_selection_export_previous = model_selection_export.delay({});

    var appGameService = {
      game: game, create: create, dice: dice, bad_dice: bad_dice, loading: loading,
      chat: { chat: chat, new_chat: new_chat },
      commands: { undo: undo, undo_log: undo_log },
      export: { board: board_export,
        game: game_export,
        models: model_selection_export
      },
      view: { scroll_left: scroll_left, scroll_right: scroll_right, scroll_up: scroll_up, scroll_down: scroll_down,
        zoom_in: zoom_in, zoom_out: zoom_out, zoom_reset: zoom_reset,
        detail: detail.changes(), drag_box: drag_box,
        flip_map: flip_map_changes, move_map: move_map, toggle_menu: toggle_menu,
        edit_damage: edit_damage, edit_damage_changes: edit_damage_changes,
        edit_label: edit_label, edit_label_changes: edit_label_changes
      },
      models: { models: models,
        changes: models_changes,
        force_changes: models_force_changes,
        flip_map: models_flip_map,
        selection: model_selection,
        selection_changes: model_selection_changes
      },
      los: { los: los,
        changes: los_changes
      },
      ruler: { ruler: ruler,
        changes: ruler_changes
      },
      templates: { templates: templates,
        changes: templates_changes,
        force_changes: templates_force_changes,
        flip_map: templates_flip_map,
        selection: template_selection,
        selection_changes: template_selection_changes
      },
      terrains: { terrains: terrains,
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

    var game_export_url = undefined;

    return appGameService;

    function mount() {
      appActionService.register('Game.set', actionGameSet).register('Game.load', actionGameLoad).register('Game.load.dataReady', actionGameLoadDataReady).register('Game.load.dataLoaded', actionGameLoadDataLoaded).register('Game.load.gameLoaded', actionGameLoadGameLoaded).register('Game.connection.batchCmd', actionGameConnectionBatchCmd).register('Game.connection.chat', actionGameConnectionChat).register('Game.connection.replayCmd', actionGameConnectionReplayCmd).register('Game.connection.sendChat', actionGameConnectionSendChat).register('Game.connection.setCmds', actionGameConnectionSetCmds).register('Game.connection.setPlayers', actionGameConnectionSetPlayers).register('Game.connection.undoCmd', actionGameConnectionUndoCmd).register('Game.invitePlayer', actionGameInvitePlayer).register('Game.connection.close', actionGameConnectionClose).register('Game.command.execute', actionGameCommandExecute).register('Game.command.replay', actionGameCommandReplay).register('Game.command.replayNext', actionGameCommandReplayNext).register('Game.command.undo', actionGameCommandUndo).register('Game.command.undoLast', actionGameCommandUndoLast).register('Game.view.scrollLeft', actionGameViewScrollLeft).register('Game.view.scrollRight', actionGameViewScrollRight).register('Game.view.scrollUp', actionGameViewScrollUp).register('Game.view.scrollDown', actionGameViewScrollDown).register('Game.view.zoomIn', actionGameViewZoomIn).register('Game.view.zoomOut', actionGameViewZoomOut).register('Game.view.zoomReset', actionGameViewZoomReset).register('Game.view.flipMap', actionGameViewFlipMap).register('Game.view.moveMap', actionGameViewMoveMap).register('Game.view.toggleMenu', actionGameViewToggleMenu).register('Game.view.editDamage.reset', actionGameViewEditDamageReset).register('Game.view.editLabel', actionGameViewEditLabel).register('Game.board.set', actionGameBoardSet).register('Game.board.setRandom', actionGameBoardSetRandom).register('Game.board.importFile', actionGameBoardImportFile).register('Game.scenario.set', actionGameScenarioSet).register('Game.scenario.setRandom', actionGameScenarioSetRandom).register('Game.scenario.generateObjectives', actionGameScenarioGenerateObjectives).register('Game.model.create', actionGameModelCreate).register('Game.model.copy', actionGameModelCopy).register('Game.model.importList', actionGameModelImportList).register('Game.model.importFile', actionGameModelImportFile).register('Game.template.create', actionGameTemplateCreate).register('Game.templates.set', actionGameTemplatesSet).register('Game.templates.setDeviationMax', actionGameTemplatesSetDeviationMax).register('Game.terrain.create', actionGameTerrainCreate).register('Game.terrains.set', actionGameTerrainsSet).register('Game.terrains.reset', actionGameTerrainsReset);
    }
    function gameExportCurrent(game) {
      console.warn('Export Game', arguments);
      fileExportService.cleanup(game_export_url);
      game_export_url = fileExportService.generate('json', game);
      return {
        name: 'clicknfeat_game.json',
        url: game_export_url
      };
    }
    function gameSaveCurrent(state) {
      return R.thread(state)(R.unless(R.pipe(R.viewOr({}, GAME_LENS), R.prop('local_stamp'), R.isNil), appGamesService.localUpdate$(R.__, state.game)));
    }
    function actionGameSet(state, game) {
      return R.thread(state)(R.set(GAME_LENS, game), gameSaveCurrent);
    }
    function actionGameLoad(state, is_online, is_private, id) {
      waitForDataReady().then(function () {
        return appActionService.do('Game.load.dataReady', is_online, is_private, id);
      });
      return R.over(GAME_LENS, R.pipe(R.defaultTo({}), gameModel.close), state);

      function waitForDataReady() {
        return R.allP([appDataService.ready, appUserService.ready, appGamesService.ready]);
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
      }).catch(appErrorService.emit);
    }
    function actionGameLoadDataLoaded(state, data) {
      loading.send(true);
      R.threadP(data)(gameModel.loadP, function (game) {
        return appActionService.do('Game.load.gameLoaded', game);
      }).catch(appErrorService.emit);
      return R.thread(state)(appModesService.reset, gameSaveCurrent);
    }
    function actionGameLoadGameLoaded(state, game) {
      loading.send(false);
      var user = R.view(USER_NAME_LENS, state);
      return R.threadP(game)(R.when(gameModel.isOnline, gameConnectionModel.openP$(user)), function (game) {
        return appActionService.do('Game.set', game);
      }).catch(appErrorService.emit);
    }
    function actionGameConnectionBatchCmd(state, msg) {
      return R.threadP(state)(R.view(GAME_LENS), gameModel.replayCommandsBatchP$(msg.cmds), function (game) {
        appActionService.do('Game.set', game);
      }).catch(appErrorService.emit);
    }
    function actionGameConnectionChat(state, msg) {
      return R.over(GAME_LENS, R.over(CHAT_LENS, R.compose(R.append(msg.chat), R.defaultTo([]))), state);
    }
    function actionGameConnectionReplayCmd(state, msg) {
      return appStateService.onAction(state, ['Game.command.replay', msg.cmd]);
    }
    function actionGameConnectionSendChat(state, msg) {
      var user_name = R.viewOr('Unknown', USER_NAME_LENS, state);
      return R.over(GAME_LENS, gameModel.sendChat$(user_name, msg), state);
    }
    function actionGameConnectionSetCmds(state, set) {
      return R.over(GAME_LENS, R.assoc(set.where, set.cmds), state);
    }
    function actionGameConnectionSetPlayers(state, msg) {
      return R.over(GAME_LENS, R.assoc('players', msg.players), state);
    }
    function actionGameConnectionUndoCmd(state, msg) {
      return appStateService.onAction(state, ['Game.command.undo', msg.cmd]);
    }
    function actionGameInvitePlayer(state, to) {
      var user_name = s.capitalize(R.viewOr('Unknown', USER_NAME_LENS, state));
      var msg = user_name + ' has invited you to join a game';
      var link = self.window.location.hash;
      console.warn('Invite player', to, msg, link);

      return appStateService.onAction(state, ['User.sendChat', { to: [to], msg: msg, link: link }]);
    }
    function actionGameConnectionClose(state) {
      return R.thread(state)(R.over(GAME_LENS, gameConnectionModel.cleanup), gameSaveCurrent);
    }
    function actionGameCommandExecute(state, cmd, args) {
      var user_name = R.view(USER_NAME_LENS, state);
      return R.threadP(state.game)(gameModel.executeCommandP$(cmd, args, user_name), function (game) {
        return appActionService.do('Game.set', game);
      }).catch(appErrorService.emit);
    }
    function actionGameCommandUndo(state, cmd) {
      return R.threadP(state.game)(gameModel.undoCommandP$(cmd), function (game) {
        return appActionService.do('Game.set', game);
      }).catch(appErrorService.emit);
    }
    function actionGameCommandUndoLast(state) {
      return R.threadP(state.game)(gameModel.undoLastCommandP, function (game) {
        return appActionService.do('Game.set', game);
      }).catch(appErrorService.emit);
    }
    function actionGameCommandReplay(state, cmd) {
      return R.threadP(state.game)(gameModel.replayCommandP$(cmd), function (game) {
        return appActionService.do('Game.set', game);
      }).catch(appErrorService.emit);
    }
    function actionGameCommandReplayNext(state) {
      return R.threadP(state.game)(gameModel.replayNextCommandP, function (game) {
        return appActionService.do('Game.set', game);
      }).catch(appErrorService.emit);
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
      var edit_label = R.view(EDIT_LABEL_LENS, state);
      appActionService.defer('Game.command.execute', 'on' + s.capitalize(edit_label.type) + 's', ['addLabel', [new_label], [edit_label.element.state.stamp]]);
      return R.set(EDIT_LABEL_LENS, {}, state);
    }
    function actionGameBoardSet(state, name) {
      var board = gameBoardModel.forName(name, state.boards);
      return appStateService.onAction(state, ['Game.command.execute', 'setBoard', [board]]);
    }
    function actionGameBoardSetRandom(state) {
      var board = undefined,
          name = gameBoardModel.name(state.game.board);
      while (name === gameBoardModel.name(state.game.board)) {
        board = state.boards[R.randomRange(0, state.boards.length - 1)];
        name = gameBoardModel.name(board);
      }
      return appStateService.onAction(state, ['Game.command.execute', 'setBoard', [board]]);
    }
    function actionGameBoardImportFile(_state_, file) {
      return R.threadP(file)(fileImportService.readP$('json'), function (data) {
        return appActionService.do('Game.command.execute', 'setBoardData', [data]);
      }).catch(appErrorService.emit);
    }
    function gameBoardExport(previous, game) {
      fileExportService.cleanup(previous.url);
      var data = {
        board: R.view(BOARD_LENS, game),
        terrain: {
          base: { x: 0, y: 0, r: 0 },
          terrains: R.thread(game)(R.viewOr(gameTerrainsModel.create(), TERRAINS_LENS), gameTerrainsModel.copyAll)
        }
      };
      console.warn('Export board', arguments, data);
      return {
        name: 'clicknfeat_board.json',
        url: fileExportService.generate('json', data)
      };
    }
    function actionGameScenarioSet(state, name, group) {
      var scenario = gameScenarioModel.forName(name, group);
      return appStateService.onAction(state, ['Game.command.execute', 'setScenario', [scenario]]);
    }
    function actionGameScenarioSetRandom(state) {
      var group = gameScenarioModel.group('SR16', state.scenarios);
      var scenario = undefined,
          name = gameScenarioModel.name(state.game.scenario);
      while (name === gameScenarioModel.name(state.game.scenario)) {
        scenario = group[1][R.randomRange(0, group[1].length - 1)];
        name = gameScenarioModel.name(scenario);
      }
      return appStateService.onAction(state, ['Game.command.execute', 'setScenario', [scenario]]);
    }
    function actionGameScenarioGenerateObjectives(state) {
      return appStateService.onAction(state, ['Game.command.execute', 'createObjectives', []]);
    }
    function actionGameModelCreate(state, model_path, repeat) {
      return R.thread(state)(R.set(CREATE_LENS, {
        base: { x: 240, y: 240, r: 0 },
        models: R.times(function (i) {
          return {
            info: model_path,
            x: 20 * i, y: 0, r: 0
          };
        }, R.defaultTo(1, repeat))
      }), appStateService.onAction$(R.__, ['Modes.switchTo', 'CreateModel']));
    }
    function actionGameModelCopy(state, create) {
      return R.thread(state)(R.set(CREATE_LENS, create), appStateService.onAction$(R.__, ['Modes.switchTo', 'CreateModel']));
    }
    function actionGameModelImportList(state, list) {
      var user = R.viewOr('Unknown', USER_NAME_LENS, state);
      return R.thread(state)(R.set(CREATE_LENS, gameFactionsModel.buildModelsList(list, user, state.factions)), appStateService.onAction$(R.__, ['Modes.switchTo', 'CreateModel']));
    }
    function actionGameModelImportFile(_state_, file) {
      return R.threadP(file)(fileImportService.readP$('json'), function (create) {
        return appActionService.do('Game.model.copy', create);
      }).catch(appErrorService.emit);
    }
    function gameModelSelectionExport(previous, game) {
      fileExportService.cleanup(previous.url);
      var data = R.thread(game)(R.view(MODEL_SELECTION_LENS), gameModelSelectionModel.get$('local'), R.ifElse(R.isEmpty, function () {
        return null;
      }, gameModelsModel.copyStamps$(R.__, R.view(MODELS_LENS, game))));
      console.warn('Export models', arguments, data);
      return {
        name: 'clicknfeat_models.json',
        url: data ? fileExportService.generate('json', data) : null
      };
    }
    function actionGameTemplateCreate(state, type) {
      return R.thread(state)(R.set(CREATE_LENS, {
        base: { x: 240, y: 240, r: 0 },
        templates: [{ type: type, x: 0, y: 0, r: 0 }]
      }), appStateService.onAction$(R.__, ['Modes.switchTo', 'CreateTemplate']));
    }
    function actionGameTemplatesSet(state, templates) {
      return R.over(GAME_LENS, R.set(TEMPLATES_LENS, templates), state);
    }
    function actionGameTemplatesSetDeviationMax(state, stamps, max) {
      return R.threadP(state)(R.viewOr({}, GAME_LENS), R.viewOr({}, TEMPLATES_LENS), gameTemplatesModel.onStampsP$('setMaxDeviation', [max], stamps), function (templates) {
        return appActionService.do('Game.templates.set', templates);
      });
    }
    function actionGameTerrainCreate(state, path) {
      return R.thread(state)(R.set(CREATE_LENS, {
        base: { x: 240, y: 240, r: 0 },
        terrains: [{ info: path, x: 0, y: 0, r: 0 }],
        infos: state.terrains
      }), appStateService.onAction$(R.__, ['Modes.switchTo', 'CreateTerrain']));
    }
    function actionGameTerrainsSet(state, terrains) {
      return R.over(GAME_LENS, R.set(TERRAINS_LENS, terrains), state);
    }
    function actionGameTerrainsReset(state) {
      return R.thread(state)(R.view(GAME_LENS), R.view(TERRAINS_LENS), gameTerrainsModel.all, R.pluck('state'), R.pluck('stamp'), function (stamps) {
        return appStateService.onAction(state, ['Game.command.execute', 'deleteTerrain', [stamps]]);
      });
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
      var game = appGameService.game.sample();
      var modes = appModesService.modes.sample();
      var current_mode = modesModel.currentModeName(modes);
      var mode = R.thread()(function () {
        return gameTerrainSelectionModel.checkMode(R.viewOr({}, TERRAIN_SELECTION_LENS, game));
      }, R.unless(R.exists, function () {
        return gameTemplateSelectionModel.checkMode(R.viewOr({}, TEMPLATES_LENS, game), R.viewOr({}, TEMPLATE_SELECTION_LENS, game));
      }), R.unless(R.exists, function () {
        return gameModelSelectionModel.checkMode(R.viewOr({}, MODELS_LENS, game), R.viewOr({}, MODEL_SELECTION_LENS, game));
      }), R.defaultTo('Default'));
      console.warn('CheckMode', mode);
      if (R.exists(mode) && mode !== current_mode) {
        appActionService.defer('Modes.switchTo', mode);
      }
    }
    function observeModelsChanges(olds, news) {
      return R.thread(gameModelsModel.all(news))(R.symmetricDifferenceWith(R.eq, gameModelsModel.all(olds)), R.map(R.path(['state', 'stamp'])), R.uniq);
    }
    function observeModelSelectionChanges(old, sel) {
      return R.concat(R.symmetricDifferenceWith(R.eq, R.propOr([], 'local', old), R.propOr([], 'local', sel)), R.symmetricDifferenceWith(R.eq, R.propOr([], 'remote', old), R.propOr([], 'remote', sel)), R.uniq);
    }
    function observeTemplatesChanges(olds, news) {
      return R.thread(gameTemplatesModel.all(news))(R.symmetricDifferenceWith(R.eq, gameTemplatesModel.all(olds)), R.map(R.path(['state', 'stamp'])), R.uniq);
    }
    function observeTerrainsChanges(olds, news) {
      return R.thread(gameTerrainsModel.all(news))(R.symmetricDifferenceWith(R.eq, gameTerrainsModel.all(olds)), R.map(R.path(['state', 'stamp'])), R.uniq);
    }
    function gameCheckNewChat(_ref9) {
      var _ref10 = _slicedToArray(_ref9, 4);

      var previous_chat = _ref10[0];
      var chat = _ref10[1];
      var user = _ref10[2];
      var last = _ref10[3];

      return R.exists(last) && !gameModel.chatIsFrom(user, last) && R.length(previous_chat) + 1 === R.length(chat);
    }
    function gameCheckBadDice(_ref11) {
      var _ref12 = _slicedToArray(_ref11, 3);

      var previous_dice = _ref12[0];
      var dice = _ref12[1];
      var last = _ref12[2];

      if (last.type === 'rollDeviation') return null;
      if (R.length(previous_dice) + 1 !== R.length(dice)) return null;
      var d = R.propOr([], 'd', last);
      if (R.length(d) < 2) return null;
      var mean = R.reduce(R.add, 0, d) / R.length(d);
      return mean < 2 ? true : null;
    }
  }
})();
//# sourceMappingURL=game.js.map
