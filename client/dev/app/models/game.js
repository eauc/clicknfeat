'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.services').factory('game', gameModelFactory);

  gameModelFactory.$inject = ['jsonStringifier', 'commands', 'gameConnection', 'gameLayers', 'gameLos', 'gameModels', 'gameModelSelection', 'gameRuler', 'gameTemplates', 'gameTemplateSelection', 'gameTerrains', 'gameTerrainSelection'];
  function gameModelFactory(jsonStringifierService, commandsModel, gameConnectionModel, gameLayersModel, gameLosModel, gameModelsModel, gameModelSelectionModel, gameRulerModel, gameTemplatesModel, gameTemplateSelectionModel, gameTerrainsModel, gameTerrainSelectionModel) {
    var DICE_LENS = R.lensProp('dice');
    var COMMANDS_LENS = R.lensProp('commands');
    var COMMANDS_LOG_LENS = R.lensProp('commands_log');
    var UNDO_LENS = R.lensProp('undo');
    var UNDO_LOG_LENS = R.lensProp('undo_log');
    var gameModel = {
      isOnline: gameIsOnline,
      description: gameDescription,
      pickForJson: gamePickForJson,
      toJson: gameToJson,
      create: gameCreate,
      loadP: gameLoadP,
      executeCommandP: gameExecuteCommandP,
      undoCommandP: gameUndoCommandP,
      undoLastCommandP: gameUndoLastCommandP,
      replayCommandP: gameReplayCommandP,
      replayCommandsBatchP: gameReplayCommandsBatchP,
      replayNextCommandP: gameReplayNextCommandP,
      sendChat: gameSendChat
    };

    var GAME_PROTO = {
      toJSON: function gameToJson() {
        return gamePickForJson(this);
      }
    };

    R.curryService(gameModel);
    return gameModel;

    function gameIsOnline(game) {
      return game.public_stamp || game.private_stamp;
    }
    function gameDescription(game) {
      return [s.capitalize(gamePlayerName('p1', game)), 'vs', s.capitalize(gamePlayerName('p2', game))].join(' ');
    }
    function gamePickForJson(game) {
      return R.pick(['players', 'commands', 'undo', 'chat', 'local_stamp', 'private_stamp', 'public_stamp'], game);
    }
    function gameToJson(game) {
      return R.thread(game)(gamePickForJson, jsonStringifierService.stringify);
    }
    function gameCreate(player1) {
      var new_game = {
        players: {
          p1: { name: R.propOr('player1', 'name', player1) },
          p2: { name: null }
        }
      };
      return new_game;
    }
    function gameLoadP(data) {
      return R.threadP(Object.create(GAME_PROTO))(extendGameDefaultWithData, gameConnectionModel.create, gameReplayAllP);

      function extendGameDefaultWithData(game) {
        return R.deepExtend(game, defaultGameState(), data);
      }
    }
    function gameExecuteCommandP(cmd, args, user_name, game) {
      return R.threadP(commandsModel.executeP(cmd, args, game))(stampCommand, R.ifElse(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var _c_ = _ref2[0];
        var game = _ref2[1];
        return gameConnectionModel.active(game);
      }, sendReplayCommand, logLocalCommand), function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2);

        var command = _ref4[0];
        var game = _ref4[1];
        return R.when(function () {
          return command.type === 'rollDice' || command.type === 'rollDeviation';
        }, R.over(DICE_LENS, R.append(command)), game);
      });

      function stampCommand(_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2);

        var command = _ref6[0];
        var game = _ref6[1];

        return [R.thread(command)(R.assoc('user', user_name), R.assoc('stamp', R.guid())), game];
      }
      function sendReplayCommand(_ref7) {
        var _ref8 = _slicedToArray(_ref7, 2);

        var command = _ref8[0];
        var game = _ref8[1];

        return R.thread(game)(gameConnectionModel.sendReplayCommand$(command), function (game) {
          return [command, game];
        });
      }
      function logLocalCommand(_ref9) {
        var _ref10 = _slicedToArray(_ref9, 2);

        var command = _ref10[0];
        var game = _ref10[1];

        return [command, R.unless(function () {
          return command.do_not_log;
        }, R.over(COMMANDS_LENS, R.append(command)), game)];
      }
    }
    function gameUndoCommandP(command, game) {
      return R.threadP(game)(R.ifElse(isInUndoLog, removeFromUndoLog, commandsModel.undoP$(command)), updateLogs);

      function isInUndoLog(game) {
        return R.thread(game)(R.viewOr([], UNDO_LOG_LENS), R.find(R.propEq('stamp', command.stamp)));
      }
      function removeFromUndoLog(game) {
        return R.over(UNDO_LOG_LENS, R.compose(R.reject(R.propEq('stamp', command.stamp)), R.defaultTo([])), game);
      }
      function updateLogs(game) {
        return R.thread(game)(R.over(COMMANDS_LENS, R.reject(R.propEq('stamp', command.stamp))), R.over(UNDO_LENS, R.append(command)));
      }
    }
    function gameUndoLastCommandP(game) {
      return R.threadP(game)(getLastCommandP, undoCommandP, updateLogs);

      function getLastCommandP(game) {
        return R.threadP(game)(R.viewOr([], COMMANDS_LENS), R.last, R.rejectIfP(R.isNil, 'Command history empty'));
      }
      function undoCommandP(command) {
        return R.threadP(game)(commandsModel.undoP$(command), function (game) {
          return [command, game];
        });
      }
      function updateLogs(_ref11) {
        var _ref12 = _slicedToArray(_ref11, 2);

        var command = _ref12[0];
        var game = _ref12[1];

        return R.thread(game)(R.over(COMMANDS_LENS, R.init), R.ifElse(gameConnectionModel.active, gameConnectionModel.sendUndoCommand$(command), R.over(UNDO_LENS, R.append(command))));
      }
    }
    function gameReplayCommandP(command, game) {
      return R.threadP(game)(R.ifElse(isInCommandsLog, removeFromCommandsLog, commandsModel.replayP$(command)), updateLogs);

      function isInCommandsLog(game) {
        return R.thread(game)(R.viewOr([], COMMANDS_LOG_LENS), R.find(R.propEq('stamp', command.stamp)));
      }
      function removeFromCommandsLog(game) {
        return R.over(COMMANDS_LOG_LENS, R.reject(R.propEq('stamp', command.stamp)), game);
      }
      function updateLogs(game) {
        return R.thread(game)(R.over(UNDO_LENS, R.reject(R.propEq('stamp', command.stamp))), R.unless(function () {
          return command.do_not_log;
        }, R.over(COMMANDS_LENS, R.append(command))));
      }
    }
    function gameReplayCommandsBatchP(cmds, game) {
      return R.threadP(game)(commandsModel.replayBatchP$(cmds), R.over(COMMANDS_LENS, R.concat(R.__, cmds)));
    }
    function gameReplayNextCommandP(game) {
      return R.threadP(game)(getNextUndoP, replayCommandP, updateLogs);

      function getNextUndoP(game) {
        return R.threadP(game)(R.viewOr([], UNDO_LENS), R.last, R.rejectIfP(R.isNil, 'Undo history empty'));
      }
      function replayCommandP(command) {
        return R.threadP(game)(commandsModel.replayP$(command), function (game) {
          return [command, game];
        });
      }
      function updateLogs(_ref13) {
        var _ref14 = _slicedToArray(_ref13, 2);

        var command = _ref14[0];
        var game = _ref14[1];

        return R.threadP(game)(R.over(UNDO_LENS, R.init), R.ifElse(gameConnectionModel.active, gameConnectionModel.sendReplayCommand$(command), R.over(COMMANDS_LENS, R.append(command))));
      }
    }
    function gameSendChat(from, msg, game) {
      return gameConnectionModel.sendEvent({
        type: 'chat',
        chat: {
          from: from,
          msg: msg
        }
      }, game);
    }
    function gamePlayerName(p, game) {
      return R.pathOr('John Doe', ['players', p, 'name'], game);
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
        layers: gameLayersModel.create(),
        ruler: gameRulerModel.create(),
        los: gameLosModel.create(),
        models: gameModelsModel.create(),
        model_selection: gameModelSelectionModel.create(),
        templates: gameTemplatesModel.create(),
        template_selection: gameTemplateSelectionModel.create(),
        terrains: gameTerrainsModel.create(),
        terrain_selection: gameTerrainSelectionModel.create()
      };
    }
    function gameReplayAllP(game) {
      return new self.Promise(function (resolve) {
        if (R.isEmpty(game.commands)) {
          resolve(game);
        }

        var batchs = R.splitEvery(Math.max(game.commands.length, 1), game.commands);
        self.requestAnimationFrame(function () {
          resolve(gameReplayBatchsP(batchs, game));
        });
      });
    }
    function gameReplayBatchsP(batchs, game) {
      if (R.isEmpty(batchs)) {
        return R.resolveP(game);
      }

      console.log('Game: ReplayBatchs:', batchs);
      return R.threadP(game)(commandsModel.replayBatchP$(batchs[0]), recurP);

      function recurP(game) {
        return new self.Promise(function (resolve) {
          self.requestAnimationFrame(function () {
            resolve(gameReplayBatchsP(R.tail(batchs), game));
          });
        });
      }
    }
  }
})();
//# sourceMappingURL=game.js.map
