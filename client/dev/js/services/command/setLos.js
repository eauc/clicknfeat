'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

angular.module('clickApp.services').factory('setLosCommand', ['commands', 'gameLos', function setLosCommandServiceFactory(commandsService, gameLosService) {
  var setLosCommandService = {
    execute: function setLosExecute(method, args, state, game) {
      if ('Function' !== R.type(gameLosService[method])) {
        return self.Promise.reject('Los unknown method ' + method);
      }

      var ctxt = {
        before: [],
        after: [],
        desc: method
      };

      return R.pipePromise(gameLosService.saveRemoteState, function (before) {
        ctxt.before = before;

        return gameLosService[method].apply(null, [].concat(_toConsumableArray(args), [state, game, game.los]));
      }, function (los) {
        game = R.assoc('los', los, game);

        return gameLosService.saveRemoteState(game.los);
      }, function (after) {
        ctxt.after = after;

        state.changeEvent('Game.los.remote.change');

        return [ctxt, game];
      })(game.los);
    },
    replay: function setLosRedo(ctxt, state, game) {
      return R.pipeP(gameLosService.resetRemote$(ctxt.after, state, game), function (los) {
        state.changeEvent('Game.los.remote.change');

        return R.assoc('los', los, game);
      })(game.los);
    },
    undo: function setLosUndo(ctxt, state, game) {
      return R.pipeP(gameLosService.resetRemote$(ctxt.before, state, game), function (los) {
        state.changeEvent('Game.los.remote.change');

        return R.assoc('los', los, game);
      })(game.los);
    }
  };
  commandsService.registerCommand('setLos', setLosCommandService);
  return setLosCommandService;
}]);
//# sourceMappingURL=setLos.js.map
