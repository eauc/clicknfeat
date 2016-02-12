'use strict';

angular.module('clickApp.services').factory('lockTemplatesCommand', ['commands', 'gameTemplates', function lockTemplatesCommandServiceFactory(commandsService, gameTemplatesService) {
  var lockTemplatesCommandService = {
    execute: function lockTemplatesExecute(lock, stamps, state, game) {
      var ctxt = {
        stamps: stamps,
        desc: lock
      };

      return R.pipeP(gameTemplatesService.lockStamps$(lock, stamps), function (game_templates) {
        game = R.assoc('templates', game_templates, game);

        state.changeEvent('Game.template.create');

        return [ctxt, game];
      })(game.templates);
    },
    replay: function lockTemplatesReplay(ctxt, state, game) {
      return R.pipeP(gameTemplatesService.lockStamps$(ctxt.desc, ctxt.stamps), function (game_templates) {
        game = R.assoc('templates', game_templates, game);

        state.changeEvent('Game.template.create');

        return game;
      })(game.templates);
    },
    undo: function lockTemplatesUndo(ctxt, state, game) {
      return R.pipeP(gameTemplatesService.lockStamps$(!ctxt.desc, ctxt.stamps), function (game_templates) {
        game = R.assoc('templates', game_templates, game);

        state.changeEvent('Game.template.create');

        return game;
      })(game.templates);
    }
  };
  commandsService.registerCommand('lockTemplates', lockTemplatesCommandService);
  return lockTemplatesCommandService;
}]);
//# sourceMappingURL=lockTemplates.js.map