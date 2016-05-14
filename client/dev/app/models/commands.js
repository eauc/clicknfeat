'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function () {
  angular.module('clickApp.services').factory('commands', commandsModelFactory).factory('allCommands', [
  // 'createModelCommand',
  // 'deleteModelCommand',
  // 'setModelSelectionCommand',
  // 'lockModelsCommand',
  // 'onModelsCommand',
  // 'createTemplateCommand',
  // 'deleteTemplateCommand',
  // 'lockTemplatesCommand',
  // 'onTemplatesCommand',
  // 'createTerrainCommand',
  // 'deleteTerrainCommand',
  // 'lockTerrainsCommand',
  // 'onTerrainsCommand',
  'rollDiceCommand',
  // 'rollDeviationCommand',
  'setBoardCommand', 'setLayersCommand',
  // 'setLosCommand',
  // 'setRulerCommand',
  'setScenarioCommand', function () {
    return {};
  }]);

  commandsModelFactory.$inject = [];
  function commandsModelFactory() {
    var CMDS_REG = {};
    var commandsModel = {
      registerCommand: commandsRegister,
      executeP: commandsExecuteP,
      undoP: commandsUndoP,
      replayP: commandsReplayP,
      replayBatchP: commandsReplayBatchP
    };
    R.curryService(commandsModel);
    return commandsModel;

    function commandsRegister(name, command) {
      console.log('register command', name, command);
      CMDS_REG[name] = command;
    }
    function commandsExecuteP(name, args, game) {
      return R.threadP(name)(findTypeP, function (cmd) {
        return cmd.executeP.apply(cmd, [].concat(_toConsumableArray(args), [game]));
      }, updateCommandType);

      function updateCommandType(_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var ctxt = _ref2[0];
        var game = _ref2[1];

        return [R.assoc('type', name, ctxt), game];
      }
    }
    function commandsUndoP(ctxt, game) {
      return R.threadP(ctxt)(findCtxtTypeP, function (cmd) {
        return cmd.undoP(ctxt, game);
      });
    }
    function commandsReplayP(ctxt, game) {
      return R.threadP(ctxt)(findCtxtTypeP, function (cmd) {
        return cmd.replayP(ctxt, game);
      });
    }
    function findTypeP(type) {
      return R.threadP(CMDS_REG)(R.prop(type), R.rejectIfP(R.isNil, 'Game: unknown command "' + type + '"'));
    }
    function findCtxtTypeP(ctxt) {
      return R.threadP(ctxt)(R.prop('type'), findTypeP);
    }
    function commandsReplayBatchP(commands, game) {
      if (R.isEmpty(commands)) {
        return R.resolveP(game);
      }
      return R.threadP(game)(replayNextCommand, recurP);

      function replayNextCommand(game) {
        return commandsModel.replayP(commands[0], game).catch(function () {
          return game;
        });
      }
      function recurP(game) {
        return commandsReplayBatchP(R.tail(commands), game);
      }
    }
  }
})();
//# sourceMappingURL=commands.js.map
