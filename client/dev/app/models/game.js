'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.services').factory('game', gameModelFactory);

  gameModelFactory.$inject = ['jsonStringifier', 'commands',
  // 'gameConnection',
  'gameLayers',
  // 'gameLos',
  // 'gameModels',
  // 'gameModelSelection',
  // 'gameRuler',
  'gameTemplates', 'gameTemplateSelection', 'gameTerrains', 'gameTerrainSelection'];
  function gameModelFactory(jsonStringifierService, commandsModel,
  // gameConnectionModel,
  gameLayersModel,
  // gameLosModel,
  // gameModelsModel,
  // gameModelSelectionModel,
  // gameRulerModel,
  gameTemplatesModel, gameTemplateSelectionModel, gameTerrainsModel, gameTerrainSelectionModel) {
    var gameModel = {
      create: gameCreate,
      loadP: gameLoadP,
      // pickForJson: gamePickForJson,
      toJson: gameToJson,
      description: gameDescription,
      executeCommandP: gameExecuteCommandP,
      // undoCommand: gameUndoCommand,
      undoLastCommandP: gameUndoLastCommandP,
      // replayCommand: gameReplayCommand,
      // replayCommandsBatch: gameReplayCommandsBatch,
      replayNextCommandP: gameReplayNextCommandP,
      // sendChat: gameSendChat,
      actionError: gameActionError
    };

    var GAME_PROTO = {
      toJSON: function gameToJson() {
        return gamePickForJson(this);
      }
    };
    var gameReplayAllP$ = R.curry(gameReplayAllP);

    R.curryService(gameModel);
    return gameModel;

    function gameCreate(player1) {
      var new_game = {
        players: {
          p1: { name: R.propOr('player1', 'name', player1) },
          p2: { name: null }
        }
      };
      return new_game;
    }
    function gameLoadP(state, data) {
      return R.threadP(Object.create(GAME_PROTO))(extendGameDefaultWithData,
      // gameConnectionModel.create,
      gameReplayAllP$(state));

      function extendGameDefaultWithData(game) {
        return R.deepExtend(game, defaultGameState(), data);
      }
    }
    function defaultGameState() {
      return {
        players: {
          p1: { name: null },
          p2: { name: null }
        },
        board: {},
        scenario: {},
        chat: [],
        commands: [],
        commands_log: [],
        undo: [],
        undo_log: [],
        dice: [],
        // ruler: gameRulerModel.create(),
        // los: gameLosModel.create(),
        // models: gameModelsModel.create(),
        // model_selection: gameModelSelectionModel.create(),
        templates: gameTemplatesModel.create(),
        template_selection: gameTemplateSelectionModel.create(),
        terrains: gameTerrainsModel.create(),
        terrain_selection: gameTerrainSelectionModel.create(),
        layers: gameLayersModel.create()
      };
    }
    function gamePickForJson(game) {
      return R.pick(['players', 'commands', 'undo', 'chat', 'local_stamp', 'private_stamp', 'public_stamp'], game);
    }
    function gameToJson(game) {
      return R.thread(game)(gamePickForJson, jsonStringifierService.stringify);
    }
    function gamePlayerName(p, game) {
      return R.pathOr('John Doe', ['players', p, 'name'], game);
    }
    function gameDescription(game) {
      return [s.capitalize(gamePlayerName('p1', game)), 'vs', s.capitalize(gamePlayerName('p2', game))].join(' ');
    }
    function gameExecuteCommandP(cmd, args, state, game) {
      return R.threadP(commandsModel.executeP(cmd, args, state, game))(stampCommand, function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var command = _ref2[0];
        var game = _ref2[1];

        // if(R.always(gameConnectionModel.active(game))) {
        //   return gameConnectionModel
        //     .sendReplayCommand(command, game);
        // }
        return logLocalCommand([command, game]);
      }, emitGameEvent);

      function stampCommand(_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2);

        var command = _ref4[0];
        var game = _ref4[1];

        return [R.thread(command)(R.assoc('user', R.pathOr('Unknown', ['user', 'state', 'name'], state)), R.assoc('stamp', R.guid())), game];
      }
      function logLocalCommand(args) {
        return R.thread(args)(appendToCommands, updateDice);
      }
      function appendToCommands(_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2);

        var command = _ref6[0];
        var game = _ref6[1];

        if (!command.do_not_log) {
          game = R.over(R.lensProp('commands'), R.append(command), game);
        }
        return [command, game];
      }
      function updateDice(_ref7) {
        var _ref8 = _slicedToArray(_ref7, 2);

        var command = _ref8[0];
        var game = _ref8[1];

        if (command.type === 'rollDice' || command.type === 'rollDeviation') {
          game = R.over(R.lensProp('dice'), R.append(command), game);
        }
        return [command, game];
      }
      function emitGameEvent(_ref9) {
        var _ref10 = _slicedToArray(_ref9, 2);

        var command = _ref10[0];
        var game = _ref10[1];

        command = command;
        state.queueChangeEventP('Game.command.execute');
        return game;
      }
    }
    // function gameUndoCommand(command, state, game) {
    //   return R.pipePromise(
    //     R.propOr([], 'undo_log'),
    //     R.find(R.propEq('stamp', command.stamp)),
    //     (log) => {
    //       if(R.exists(log)) {
    //         console.log('Game : undoCmd log', command);
    //         let log = R.propOr([], 'undo_log', game);
    //         return R.assoc('undo_log',
    //                        R.reject(R.propEq('stamp', command.stamp), log),
    //                        game);
    //       }
    //       return commandsModel
    //         .undo(command, state, game);
    //     },
    //     (game) => {
    //       let commands = R.propOr([], 'commands', game);
    //       let undo = R.propOr([], 'undo', game);
    //       return R.pipe(
    //         R.assoc('commands', R.reject(R.propEq('stamp', command.stamp), commands)),
    //         R.assoc('undo', R.append(command, undo))
    //       )(game);
    //     },
    //     (game) => {
    //       state.changeEvent('Game.command.undo');
    //       return game;
    //     }
    //   )(game);
    // }
    function gameUndoLastCommandP(state, game) {
      return R.threadP(game)(getLastCommand, undoCommand, updateLogs, sendChangeEvent);

      function getLastCommand(game) {
        return R.threadP(game)(R.propOr([], 'commands'), R.last, R.rejectIf(R.isNil, 'Command history empty'));
      }
      function undoCommand(command) {
        return R.threadP(game)(commandsModel.undoP$(command, state), function (game) {
          return [command, game];
        });
      }
      function updateLogs(_ref11) {
        var _ref12 = _slicedToArray(_ref11, 2);

        var command = _ref12[0];
        var game = _ref12[1];

        return R.threadP(game)(removeFromCommands, function (game) {
          // if(gameConnectionModel.active(game)) {
          //   return gameConnectionModel
          //     .sendUndoCommand(command, game);
          // }
          return addToUndo(game);
        });

        function removeFromCommands(game) {
          return R.over(R.lensProp('commands'), R.init, game);
        }
        function addToUndo(game) {
          return R.over(R.lensProp('undo'), R.append(command), game);
        }
      }
      function sendChangeEvent(game) {
        state.queueChangeEventP('Game.command.undo');
        return game;
      }
    }
    // function gameReplayCommand(command, state, game) {
    //   return R.pipePromise(
    //     R.propOr([], 'commands_log'),
    //     R.find(R.propEq('stamp', command.stamp)),
    //     (log) => {
    //       if(R.exists(log)) {
    //         console.log('Game: replayCmd log', command);
    //         return R.over(R.lensProp('commands_log'),
    //                       R.reject(R.propEq('stamp', command.stamp)),
    //                       game);
    //       }
    //       return commandsModel
    //         .replay(command, state, game);
    //     },
    //     (game) => {
    //       return R.pipe(
    //         R.over(R.lensProp('undo'),
    //                R.reject(R.propEq('stamp', command.stamp))),
    //         (game) => {
    //           if(command.do_not_log) return game;

    //           return R.over(R.lensProp('commands'),
    //                         R.append(command),
    //                         game);
    //         }
    //       )(game);
    //     },
    //     (game) => {
    //       state.changeEvent('Game.command.replay');
    //       return game;
    //     }
    //   )(game);
    // }
    // function gameReplayCommandsBatch(cmds, state, game) {
    //   return R.pipeP(
    //     commandsModel.replayBatch$(cmds, state),
    //     R.over(R.lensProp('commands'),
    //            R.flip(R.concat)(cmds))
    //   )(game);
    // }
    function gameReplayNextCommandP(state, game) {
      return R.threadP(game)(getNextUndo, replayCommand, updateLogs, sendChangeEvent);

      function getNextUndo(game) {
        return R.threadP(game)(R.propOr([], 'undo'), R.last, R.rejectIf(R.isNil, 'Undo history empty'));
      }
      function replayCommand(command) {
        return R.threadP(game)(commandsModel.replayP$(command, state), function (game) {
          return [command, game];
        });
      }
      function updateLogs(_ref13) {
        var _ref14 = _slicedToArray(_ref13, 2);

        var command = _ref14[0];
        var game = _ref14[1];

        return R.threadP(game)(removeFromUndo, function (game) {
          // if(gameConnectionModel.active(game)) {
          //   return gameConnectionModel
          //     .sendReplayCommand(command, game);
          // }
          return addToCommands(game);
        });

        function removeFromUndo(game) {
          return R.over(R.lensProp('undo'), R.init, game);
        }
        function addToCommands(game) {
          return R.over(R.lensProp('commands'), R.append(command), game);
        }
      }
      function sendChangeEvent(game) {
        state.queueChangeEventP('Game.command.replay');
        return game;
      }
    }
    // function gameSendChat(from, msg, game) {
    //   return gameConnectionModel
    //     .sendEvent({
    //       type: 'chat',
    //       chat: {
    //         from: from,
    //         msg: msg
    //       }
    //     }, game);
    // }
    function gameReplayBatchsP(batchs, state, game) {
      if (R.isEmpty(batchs)) {
        return self.Promise.resolve(game);
      }

      console.log('Game: ReplayBatchs:', batchs);
      return R.threadP(game)(commandsModel.replayBatchP$(batchs[0], state), recurP);

      function recurP(game) {
        return new self.Promise(function (resolve) {
          self.requestAnimationFrame(function () {
            resolve(gameReplayBatchsP(R.tail(batchs), state, game));
          });
        });
      }
    }
    function gameReplayAllP(state, game) {
      return new self.Promise(function (resolve) {
        if (R.isEmpty(game.commands)) {
          resolve(game);
        }

        var batchs = R.splitEvery(game.commands.length, game.commands);
        self.requestAnimationFrame(function () {
          resolve(gameReplayBatchsP(batchs, state, game));
        });
      });
    }
    function gameActionError(state, error) {
      state.queueChangeEventP('Game.action.error', error);
      return null;
    }
  }
})();
//# sourceMappingURL=game.js.map
