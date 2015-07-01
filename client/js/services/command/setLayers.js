'use strict';

self.setLayersCommandServiceFactory = function setLayersCommandServiceFactory(commandsService,
                                                                              gameLayersService) {
  var setLayersCommandService = {
    execute: function setLayersExecute(cmd, l, scope, game) {
      if('Function' !== R.type(gameLayersService[cmd])) return;
      var ctxt = {
        before: game.layers,
        desc: cmd+'('+l+')',
      };
      game.layers = gameLayersService[cmd](l, game.layers);
      ctxt.after = game.layers;
      scope.gameEvent('changeLayers');
      return ctxt;
    },
    replay: function setLayersRedo(ctxt, scope, game) {
      game.layers = ctxt.after;
      scope.gameEvent('changeLayers');
    },
    undo: function setLayersUndo(ctxt, scope, game) {
      game.layers = ctxt.before;
      scope.gameEvent('changeLayers');
    }
  };
  commandsService.registerCommand('setLayers', setLayersCommandService);
  return setLayersCommandService;
};
