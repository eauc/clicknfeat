'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

angular.module('clickApp.services').factory('setRulerCommand', ['commands', 'gameRuler', function setRulerCommandServiceFactory(commandsService, gameRulerService) {
  var setRulerCommandService = {
    execute: function setRulerExecute(method, args, state, game) {
      if ('Function' !== R.type(gameRulerService[method])) {
        return self.Promise.reject('Ruler unknown method ' + method);
      }

      var ctxt = {
        before: [],
        after: [],
        desc: method
      };

      return R.pipePromise(gameRulerService.saveRemoteState, function (before) {
        ctxt.before = before;

        return gameRulerService[method].apply(null, [].concat(_toConsumableArray(args), [state, game.ruler]));
      }, function (ruler) {
        game = R.assoc('ruler', ruler, game);

        return gameRulerService.saveRemoteState(game.ruler);
      }, function (after) {
        ctxt.after = after;

        state.changeEvent('Game.ruler.remote.change');

        return [ctxt, game];
      })(game.ruler);
    },
    replay: function setRulerRedo(ctxt, state, game) {
      game = R.over(R.lensProp('ruler'), gameRulerService.resetRemote$(ctxt.after, state), game);
      state.changeEvent('Game.ruler.remote.change');
      return game;
    },
    undo: function setRulerUndo(ctxt, state, game) {
      game = R.over(R.lensProp('ruler'), gameRulerService.resetRemote$(ctxt.before, state), game);
      state.changeEvent('Game.ruler.remote.change');
      return game;
    }
  };
  commandsService.registerCommand('setRuler', setRulerCommandService);
  return setRulerCommandService;
}]);
//# sourceMappingURL=setRuler.js.map