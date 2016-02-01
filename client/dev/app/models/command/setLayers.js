'use strict';

angular.module('clickApp.services').factory('setLayersCommand', ['commands', 'gameLayers', function setLayersCommandServiceFactory(commandsService, gameLayersService) {
  var setLayersCommandService = {
    execute: function setLayersExecute(cmd, l, state, game) {
      if ('Function' !== R.type(gameLayersService[cmd])) {
        return self.Promise.reject('Layers unknown method "' + cmd + '"');
      }

      var ctxt = {
        before: game.layers,
        desc: cmd + '(' + l + ')'
      };
      game = R.assoc('layers', gameLayersService[cmd](l, game.layers), game);
      ctxt.after = game.layers;

      state.changeEvent('Game.layers.change');

      return [ctxt, game];
    },
    replay: function setLayersRedo(ctxt, state, game) {
      game = R.assoc('layers', ctxt.after, game);

      state.changeEvent('Game.layers.change');

      return game;
    },
    undo: function setLayersUndo(ctxt, state, game) {
      game = R.assoc('layers', ctxt.before, game);

      state.changeEvent('Game.layers.change');

      return game;
    }
  };
  commandsService.registerCommand('setLayers', setLayersCommandService);
  return setLayersCommandService;
}]);
//# sourceMappingURL=setLayers.js.map
