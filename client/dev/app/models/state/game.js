'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.services').factory('stateGame', stateGameModelFactory);

  stateGameModelFactory.$inject = ['fileExport', 'appState', 'state', 'modes', 'games', 'game',
  // 'gameBoard',
  'gameConnection',
  // 'gameFactions',
  // 'gameModels',
  // 'gameModelSelection',
  // 'gameScenario',
  // 'gameTerrains',
  // 'gameTemplates',
  // 'gameTemplateSelection',
  // 'fileImport',
  'allCommands'];

  // 'allTemplates',
  function stateGameModelFactory(fileExportService, appStateService, stateModel, modesModel, gamesModel, gameModel,
  // gameBoardModel,
  gameConnectionModel) {
    // gameFactionsModel,
    // gameModelsModel,
    // gameModelSelectionModel,
    // gameScenarioModel,
    // gameTerrainsModel,
    // gameTemplatesModel,
    // gameTemplateSelectionModel,
    // fileImportService) {
    var GAME_LENS = R.lensProp('game');
    var stateGameModel = {
      create: stateGamesCreate,
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
      // onUpdate: stateGameOnUpdate,
      // onInvitePlayer: stateGameOnInvitePlayer,
      // onModelCreate: stateGameOnModelCreate,
      // onModelCopy: stateGameOnModelCopy,
      // onModelImportList: stateGameOnModelImportList,
      // onModelImportFile: stateGameOnModelImportFile,
      // onModelSelectionLocalChange: stateGameOnModelSelectionLocalChange,
      // onTemplateCreate: stateGameOnTemplateCreate,
      // onTemplateSelectionLocalChange: stateGameOnTemplateSelectionLocalChange,
      // onTerrainCreate: stateGameOnTerrainCreate,
      // onTerrainReset: stateGameOnTerrainReset,
      // onBoardSet: stateGameOnBoardSet,
      // onBoardSetRandom: stateGameOnBoardSetRandom,
      // onBoardImportFile: stateGameOnBoardImportFile,
      // onScenarioSet: stateGameOnScenarioSet,
      // onScenarioSetRandom: stateGameOnScenarioSetRandom,
      // onScenarioRefresh: stateGameOnScenarioRefresh,
      // onScenarioGenerateObjectives: stateGameOnScenarioGenerateObjectives,
      // onSelectionLocalChange: stateGameOnSelectionLocalChange,
      updateExport: stateGameUpdateExport,
      saveCurrent: stateGameSaveCurrent
    };
    // const exportCurrentGame = stateExportsModel
    //         .exportP$('game', R.prop('game'));
    // const exportCurrentBoard = stateExportsModel
    //         .exportP$('board', exportBoardData);
    R.curryService(stateGameModel);
    stateModel.register(stateGameModel);
    return stateGameModel;

    function stateGamesCreate(state) {
      appStateService.addReducer('Game.set', stateGameModel.onSet).addReducer('Game.load', stateGameModel.onLoad).addReducer('Game.load.dataReady', stateGameModel.onLoadDataReady).addReducer('Game.load.dataLoaded', stateGameModel.onLoadDataLoaded).addReducer('Game.load.gameLoaded', stateGameModel.onLoadGameLoaded).addReducer('Game.connection.close', stateGameModel.onConnectionClose).addReducer('Game.command.execute', stateGameModel.onCommandExecute).addReducer('Game.command.undo', stateGameModel.onCommandUndo).addReducer('Game.command.replay', stateGameModel.onCommandReplay).addReducer('Game.command.replayBatch', stateGameModel.onCommandReplayBatch).addReducer('Game.command.undoLast', stateGameModel.onCommandUndoLast).addReducer('Game.command.replayNext', stateGameModel.onCommandReplayNext).addReducer('Game.setCmds', stateGameModel.onSetCmds).addReducer('Game.setPlayers', stateGameModel.onSetPlayers).addReducer('Game.newChatMsg', stateGameModel.onNewChatMsg).addListener('Game.change', stateGameModel.saveCurrent);
      // .addReducer('Game.invitePlayer'        , stateGameModel.onInvitePlayer)
      // .addReducer('Game.model.create'        , stateGameModel.onModelCreate)
      // .addReducer('Game.model.copy'          , stateGameModel.onModelCopy)
      // .addReducer('Game.model.importList'    , stateGameModel.onModelImportList)
      // .addReducer('Game.model.importFile'    , stateGameModel.onModelImportFile)
      // .addReducer('Game.template.create'     , stateGameModel.onTemplateCreate)
      // .addReducer('Game.terrain.create'      , stateGameModel.onTerrainCreate)
      // .addReducer('Game.terrain.reset'       , stateGameModel.onTerrainReset)
      // .addReducer('Game.board.set'           , stateGameModel.onBoardSet)
      // .addReducer('Game.board.setRandom'     , stateGameModel.onBoardSetRandom)
      // .addReducer('Game.board.importFile'    , stateGameModel.onBoardImportFile)
      // .addReducer('Game.scenario.set'        , stateGameModel.onScenarioSet)
      // .addReducer('Game.scenario.setRandom'  , stateGameModel.onScenarioSetRandom)
      // .addReducer('Game.scenario.refresh'    , stateGameModel.onScenarioRefresh)
      // .addReducer('Game.scenario.generateObjectives',
      //             stateGameModel.onScenarioGenerateObjectives)
      // .addListener('Game.model.selection.local.change',
      //              stateGameModel.onModelSelectionLocalChange)
      // .addListener('Game.template.selection.local.change',
      //              stateGameModel.onGameTemplateSelectionLocalChange)
      // .addListener('Game.selection.local.change',
      //              stateGameModel.onGameSelectionLocalChange);

      appStateService.onChange('AppState.change', 'Game.change', R.view(GAME_LENS));
      var game_export_cell = appStateService.cell('Game.change', stateGameModel.updateExport, {});

      return R.thread(state)(R.assoc('game', null), R.assocPath(['exports', 'game'], game_export_cell));
    }
    // function stateGameSave(state) {
    //   return R.thread()(
    //     () => exportCurrentModelSelectionP(state),
    //     () => exportCurrentBoard(state)
    //   );
    // }
    function stateGameOnSet(state, _event_, _ref) {
      var _ref2 = _slicedToArray(_ref, 1);

      var game = _ref2[0];

      return R.set(GAME_LENS, game, state);
    }
    function stateGameOnLoad(state, _event_, _ref3) {
      var _ref4 = _slicedToArray(_ref3, 3);

      var is_online = _ref4[0];
      var is_private = _ref4[1];
      var id = _ref4[2];

      return waitForDataReady().then(function () {
        return appStateService.reduce('Game.load.dataReady', is_online, is_private, id);
      });

      function waitForDataReady() {
        return R.allP([state.data_ready, state.user_ready, state.games_ready]);
      }
    }
    function stateGameOnLoadDataReady(state, _event_, _ref5) {
      var _ref6 = _slicedToArray(_ref5, 3);

      var is_online = _ref6[0];
      var is_private = _ref6[1];
      var id = _ref6[2];

      return R.threadP()(R.ifElse(function () {
        return is_online;
      }, function () {
        return gamesModel.loadOnlineGameP(is_private, id);
      }, function () {
        return gamesModel.loadLocalGameP(id, state.local_games);
      }), function (data) {
        return appStateService.reduce('Game.load.dataLoaded', data);
      });
    }
    function stateGameOnLoadDataLoaded(state, _event_, _ref7) {
      var _ref8 = _slicedToArray(_ref7, 1);

      var data = _ref8[0];

      appStateService.emit('Game.loading');
      R.threadP(data)(gameModel.loadP, function (game) {
        return appStateService.reduce('Game.load.gameLoaded', game);
      });
      return R.assoc('modes', modesModel.init(), state);
    }
    function stateGameOnLoadGameLoaded(state, _event_, _ref9) {
      var _ref10 = _slicedToArray(_ref9, 1);

      var game = _ref10[0];

      appStateService.emit('Game.loaded');
      var user = R.path(['user', 'state', 'name'], state);
      return R.threadP(game)(R.when(gameModel.isOnline, gameConnectionModel.openP$(user)), function (game) {
        return appStateService.reduce('Game.set', game);
      });
    }
    function stateGameOnConnectionClose(state, _event_) {
      return R.over(GAME_LENS, gameConnectionModel.cleanup, state);
    }
    function stateGameOnCommandExecute(state, _event_, _ref11) {
      var _ref12 = _slicedToArray(_ref11, 2);

      var cmd = _ref12[0];
      var args = _ref12[1];

      return R.threadP(state.game)(gameModel.executeCommandP$(cmd, args), function (game) {
        return appStateService.reduce('Game.set', game);
      }).catch(function (error) {
        return appStateService.reduce('Game.error', error);
      });
    }
    function stateGameOnCommandUndo(state, _event_, _ref13) {
      var _ref14 = _slicedToArray(_ref13, 1);

      var cmd = _ref14[0];

      return R.threadP(state.game)(gameModel.undoCommandP$(cmd), function (game) {
        return appStateService.reduce('Game.set', game);
      }).catch(function (error) {
        return appStateService.reduce('Game.error', error);
      });
    }
    function stateGameOnCommandUndoLast(state, _event_) {
      return R.threadP(state.game)(gameModel.undoLastCommandP, function (game) {
        return appStateService.reduce('Game.set', game);
      }).catch(function (error) {
        return appStateService.reduce('Game.error', error);
      });
    }
    function stateGameOnCommandReplay(state, _event_, _ref15) {
      var _ref16 = _slicedToArray(_ref15, 1);

      var cmd = _ref16[0];

      return R.threadP(state.game)(gameModel.replayCommandP$(cmd), function (game) {
        return appStateService.reduce('Game.set', game);
      }).catch(function (error) {
        return appStateService.reduce('Game.error', error);
      });
    }
    function stateGameOnCommandReplayBatch(state, _event_, _ref17) {
      var _ref18 = _slicedToArray(_ref17, 1);

      var cmds = _ref18[0];

      return R.threadP(state.game)(gameModel.replayCommandsBatchP$(cmds), function (game) {
        return appStateService.reduce('Game.set', game);
      }).catch(function (error) {
        return appStateService.reduce('Game.error', error);
      });
    }
    function stateGameOnCommandReplayNext(state, _event_) {
      return R.threadP(state.game)(gameModel.replayNextCommandP, function (game) {
        return appStateService.reduce('Game.set', game);
      }).catch(function (error) {
        return appStateService.reduce('Game.error', error);
      });
    }
    function stateGameOnSetCmds(state, _event_, _ref19) {
      var _ref20 = _slicedToArray(_ref19, 1);

      var set = _ref20[0];

      return R.over(GAME_LENS, R.assoc(set.where, set.cmds), state);
    }
    function stateGameOnSetPlayers(state, _event_, _ref21) {
      var _ref22 = _slicedToArray(_ref21, 1);

      var players = _ref22[0];

      return R.over(GAME_LENS, R.assoc('players', players), state);
    }
    function stateGameOnNewChatMsg(state, _event_, _ref23) {
      var _ref24 = _slicedToArray(_ref23, 1);

      var msg = _ref24[0];

      return R.over(GAME_LENS, R.over(R.lensProp('chat'), R.compose(R.append(msg.chat), R.defaultTo([]))), state);
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
    // function stateGameOnModelCreate(state, _event_, model_path, repeat) {
    //   state.create = {
    //     base: { x: 240, y: 240, r: 0 },
    //     models: R.times((i) => ({
    //       info: model_path,
    //       x: 20*i, y: 0, r: 0
    //     }), R.defaultTo(1, repeat))
    //   };
    //   return state.eventP('Modes.switchTo', 'CreateModel');
    // }
    // function stateGameOnModelCopy(state, _event_, create) {
    //   state.create = create;
    //   return state.eventP('Modes.switchTo', 'CreateModel');
    // }
    // function stateGameOnModelImportList(state, _event_, list) {
    //   const user = R.pathOr('Unknown', ['user','state','name'], state);
    //   state.create = gameFactionsModel
    //     .buildModelsList(list, user, state.factions.references);
    //   console.info('doImportList', list, state.create);
    //   return state.eventP('Modes.switchTo', 'CreateModel');
    // }
    // function stateGameOnModelImportFile(state, _event_, file) {
    //   return R.threadP(file)(
    //     fileImportService.readP$('json'),
    //     (create) => {
    //       state.create = create;
    //       return state.eventP('Modes.switchTo', 'CreateModel');
    //     }
    //   ).catch(gameModel.actionError$(state));
    // }
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
    //     state.queueChangeEventP('Game.model.selection.local.updateSingle',
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
    //         state.queueChangeEventP('Game.model.selection.local.updateSingle',
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
    // function stateGameOnTemplateCreate(state, _event_, type) {
    //   state.create = {
    //     base: { x: 240, y: 240, r: 0 },
    //     templates: [ { type: type, x: 0, y: 0, r: 0 } ]
    //   };
    //   return state.eventP('Modes.switchTo', 'CreateTemplate');
    // }
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
    //     state.queueChangeEventP('Game.template.selection.local.updateSingle',
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
    //         state.queueChangeEventP('Game.template.selection.local.updateSingle',
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
    // function stateGameOnTerrainCreate(state, _event_, path) {
    //   state.create = {
    //     base: { x: 240, y: 240, r: 0 },
    //     terrains: [ {
    //       info: path,
    //       x: 0, y: 0, r: 0
    //     } ]
    //   };
    //   return state.eventP('Modes.switchTo', 'CreateTerrain');
    // }
    // function stateGameOnTerrainReset(state, _event_) {
    //   return R.threadP(state.game)(
    //     R.prop('terrains'),
    //     gameTerrainsModel.all,
    //     R.pluck('state'),
    //     R.pluck('stamp'),
    //     (stamps) => state.eventP('Game.command.execute',
    //                              'deleteTerrain', [stamps])
    //   ).catch(gameModel.actionError$(state));
    // }
    // function stateGameOnBoardSet(state, _event_, name) {
    //   let board = gameBoardModel.forName(name, state.boards);
    //   return state.eventP('Game.command.execute',
    //                       'setBoard', [board]);
    // }
    // function stateGameOnBoardSetRandom(state, _event_) {
    //   let board, name = gameBoardModel.name(state.game.board);
    //   while(name === gameBoardModel.name(state.game.board)) {
    //     board = state.boards[R.randomRange(0, state.boards.length-1)];
    //     name = gameBoardModel.name(board);
    //   }
    //   return state.eventP('Game.command.execute',
    //                       'setBoard', [board]);
    // }
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
    // function stateGameOnScenarioSet(state, _event_, name, group) {
    //   const scenario = gameScenarioModel.forName(name, group);
    //   return state.eventP('Game.command.execute',
    //                       'setScenario', [scenario]);
    // }
    // function stateGameOnScenarioSetRandom(state, _event_) {
    //   const group = gameScenarioModel.group('SR15', state.scenarios);
    //   let scenario, name = gameScenarioModel.name(state.game.scenario);
    //   while(name === gameScenarioModel.name(state.game.scenario)) {
    //     scenario = group[1][R.randomRange(0, group[1].length-1)];
    //     name = gameScenarioModel.name(scenario);
    //   }
    //   return state.eventP('Game.command.execute',
    //                       'setScenario', [scenario]);
    // }
    // function stateGameOnScenarioRefresh(state, _event_) {
    //   state.queueChangeEventP('Game.scenario.refresh');
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
    function stateGameSaveCurrent(game) {
      if (R.isNil(R.prop('local_stamp', game))) {
        return;
      }
      self.window.requestAnimationFrame(function () {
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
  }
})();
//# sourceMappingURL=game.js.map
