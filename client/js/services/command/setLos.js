'use strict';

angular.module('clickApp.services').factory('setLosCommand', ['commands', 'gameLos', function setLosCommandServiceFactory(commandsService, gameLosService) {
  var setLosCommandService = {
    execute: function setLosExecute(method /* ...args..., scope, game */) {
      if ('Function' !== R.type(gameLosService[method])) {
        return self.Promise.reject('Los unknown method ' + method);
      }

      var args = Array.prototype.slice.call(arguments);
      var game = R.last(args);
      var ctxt = {
        before: [],
        after: [],
        desc: method
      };
      args = R.append(game.los, R.slice(1, -1, args));

      return R.pipeP(R.bind(self.Promise.resolve, self.Promise), function () {
        return gameLosService.saveRemoteState(game.los);
      }, function (before) {
        ctxt.before = before;

        return gameLosService[method].apply(null, args);
      }, function (los) {
        game.los = los;

        return gameLosService.saveRemoteState(game.los);
      }, function (after) {
        ctxt.after = after;
        return ctxt;
      })();
    },
    replay: function setLosRedo(ctxt, scope, game) {
      game.los = gameLosService.resetRemote(ctxt.after, scope, game.los);
    },
    undo: function setLosUndo(ctxt, scope, game) {
      game.los = gameLosService.resetRemote(ctxt.before, scope, game.los);
    }
  };
  commandsService.registerCommand('setLos', setLosCommandService);
  return setLosCommandService;
}]);
//# sourceMappingURL=setLos.js.map
