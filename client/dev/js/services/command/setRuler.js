'use strict';

angular.module('clickApp.services').factory('setRulerCommand', ['commands', 'gameRuler', function setRulerCommandServiceFactory(commandsService, gameRulerService) {
  var setRulerCommandService = {
    execute: function setRulerExecute(method) /*, scope, game */{
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      if ('Function' !== R.type(gameRulerService[method])) {
        return self.Promise.reject('Ruler unknown method ' + method);
      }

      var game = R.last(args);
      var ctxt = {
        before: [],
        after: [],
        desc: method
      };
      args = R.append(game.ruler, R.slice(0, -1, args));

      return R.pipePromise(function () {
        return gameRulerService.saveRemoteState(game.ruler);
      }, function (before) {
        ctxt.before = before;

        return gameRulerService[method].apply(null, args);
      }, function (ruler) {
        game.ruler = ruler;

        return gameRulerService.saveRemoteState(game.ruler);
      }, function (after) {
        ctxt.after = after;
        return ctxt;
      })();
    },
    replay: function setRulerRedo(ctxt, scope, game) {
      game.ruler = gameRulerService.resetRemote(ctxt.after, scope, game.ruler);
    },
    undo: function setRulerUndo(ctxt, scope, game) {
      game.ruler = gameRulerService.resetRemote(ctxt.before, scope, game.ruler);
    }
  };
  commandsService.registerCommand('setRuler', setRulerCommandService);
  return setRulerCommandService;
}]);
//# sourceMappingURL=setRuler.js.map
