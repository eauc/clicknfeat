'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

angular.module('clickApp.services').factory('commands', [function commandsServiceFactory() {
  var CMD_REGS = {};
  var commandsService = {
    registerCommand: function commandsRegister(name, command) {
      console.log('register command', name, command);
      CMD_REGS[name] = command;
    },
    execute: function commandsExecute(name, args, state, game) {
      return R.pipePromise(R.prop(name), R.rejectIf(R.isNil, 'execute unknown command "' + name + '"'), function (cmd) {
        return cmd.execute.apply(null, [].concat(_toConsumableArray(args), [state, game]));
      }, function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var ctxt = _ref2[0];
        var game = _ref2[1];

        return [R.assoc('type', name, ctxt), game];
      })(CMD_REGS);
    },
    undo: function commandsUndo(ctxt, state, game) {
      return R.pipePromise(R.prop(ctxt.type), R.rejectIf(R.isNil, 'undo unknown command "' + ctxt.type + '"'), function (cmd) {
        return cmd.undo(ctxt, state, game);
      })(CMD_REGS);
    },
    replay: function commandsReplay(ctxt, state, game) {
      return R.pipePromise(R.prop(ctxt.type), R.rejectIf(R.isNil, 'replay unknown command ' + ctxt.type), function (cmd) {
        return cmd.replay(ctxt, state, game);
      })(CMD_REGS);
    },
    replayBatch: function commandsReplayBatch(commands, state, game) {
      return R.pipePromise(function () {
        if (R.isEmpty(commands)) return game;

        return R.pipeP(function (game) {
          return commandsService.replay(commands[0], state, game).catch(R.always(game));
        }, commandsService.replayBatch$(R.tail(commands), state))(game);
      })();
    }
  };
  R.curryService(commandsService);
  return commandsService;
}]).factory('allCommands', ['createModelCommand', 'deleteModelCommand', 'setModelSelectionCommand', 'lockModelsCommand', 'onModelsCommand', 'createTemplateCommand', 'deleteTemplatesCommand', 'lockTemplatesCommand', 'onTemplatesCommand', 'createTerrainCommand', 'deleteTerrainCommand', 'lockTerrainsCommand', 'onTerrainsCommand', 'rollDiceCommand', 'rollDeviationCommand', 'setBoardCommand', 'setLayersCommand', 'setLosCommand', 'setRulerCommand', 'setScenarioCommand', function () {
  return {};
}]);
//# sourceMappingURL=commands.js.map
