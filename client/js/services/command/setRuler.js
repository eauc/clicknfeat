'use strict';

self.setRulerCommandServiceFactory = function setRulerCommandServiceFactory(commandsService,
                                                                            gameRulerService) {
  var setRulerCommandService = {
    execute: function setRulerExecute(method /* ...args..., scope, game */) {
      if('Function' !== R.type(gameRulerService[method])) return;

      var args = Array.prototype.slice.call(arguments);
      var game = R.last(args);
      var scope = R.nth(-2, args);
      var ctxt = {
        before: [],
        after: [],
        desc: method,
      };
      args = R.append(game.ruler, R.slice(1, -1, args));

      ctxt.before = gameRulerService.saveRemoteState(game.ruler);
      game.ruler = gameRulerService[method].apply(null, args);
      ctxt.after = gameRulerService.saveRemoteState(game.ruler);

      return ctxt;
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
};
