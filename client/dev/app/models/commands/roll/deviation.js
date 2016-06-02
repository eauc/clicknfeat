'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.services').factory('rollDeviationCommand', rollDeviationCommandModelFactory);

  rollDeviationCommandModelFactory.$inject = ['commands', 'onTemplatesCommand'];
  function rollDeviationCommandModelFactory(commandsModel, onTemplatesCommandModel) {
    var rollDeviationCommandModel = {
      executeP: rollDeviationExecuteP,
      replayP: rollDiceReplayP,
      undoP: rollDiceUndoP
    };

    commandsModel.registerCommand('rollDeviation', rollDeviationCommandModel);
    return rollDeviationCommandModel;

    function rollDeviationExecuteP(stamps, game) {
      var direction = R.randomRange(1, 6);
      var distance = R.randomRange(1, 6);

      return R.threadP()(function () {
        return onTemplatesCommandModel.executeP('deviate', [direction, distance], stamps, game);
      }, function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var ctxt = _ref2[0];
        var game = _ref2[1];

        ctxt = R.thread(ctxt)(R.assoc('desc', 'AoE deviation : direction ' + direction + ', distance ' + distance + '"'), R.assoc('r', direction), R.assoc('d', distance));
        return [ctxt, game];
      });
    }
    function rollDiceReplayP(ctxt, game) {
      return onTemplatesCommandModel.replayP(ctxt, game);
    }
    function rollDiceUndoP(ctxt, game) {
      return onTemplatesCommandModel.undoP(ctxt, game);
    }
  }
})();
//# sourceMappingURL=deviation.js.map
