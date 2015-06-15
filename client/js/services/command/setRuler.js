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

      var previous = getOriginTarget(game.ruler);
      ctxt.before = gameRulerService.saveRemoteState(game.ruler);
      game.ruler = gameRulerService[method].apply(null, args);
      ctxt.after = gameRulerService.saveRemoteState(game.ruler);
      refreshOriginTarget(previous, scope, game.ruler);

      return ctxt;
    },
    replay: function setRulerRedo(ctxt, scope, game) {
      var previous = getOriginTarget(game.ruler);
      game.ruler = gameRulerService.resetRemote(ctxt.after, scope, game.ruler);
      refreshOriginTarget(previous, scope, game.ruler);
    },
    undo: function setRulerUndo(ctxt, scope, game) {
      var previous = getOriginTarget(game.ruler);
      game.ruler = gameRulerService.resetRemote(ctxt.before, scope, game.ruler);
      refreshOriginTarget(previous, scope, game.ruler);
    }
  };
  function getOriginTarget(ruler) {
    return  {
      origin: gameRulerService.origin(ruler),
      target: gameRulerService.target(ruler)
    };
  }
  function refreshOriginTarget(previous, scope, ruler) {
    var next = getOriginTarget(ruler);

    R.pipe(
      R.uniq,
      R.reject(R.isNil),
      R.forEach(function(stamp) {
        scope.gameEvent('changeModel-'+stamp);
      })
    )([previous.origin,
       previous.target,
       next.origin,
       next.target
      ]);
  }
  commandsService.registerCommand('setRuler', setRulerCommandService);
  return setRulerCommandService;
};
