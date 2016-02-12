'use strict';

angular.module('clickApp.services').factory('setModelSelectionCommand', ['commands', 'gameModelSelection', function setModelSelectionCommandServiceFactory(commandsService, gameModelSelectionService) {
  var setModelSelectionCommandService = {
    execute: function setModelSelectionExecute(method, stamps, state, game) {
      if ('Function' !== R.type(gameModelSelectionService[method])) {
        return self.Promise.reject('SetModelSelection unknown method ' + method);
      }

      var selection = gameModelSelectionService[method]('local', stamps, state, game.model_selection);
      game = R.assoc('model_selection', selection, game);

      var ctxt = {
        after: gameModelSelectionService.get('local', game.model_selection),
        desc: '',
        do_not_log: true
      };
      return [ctxt, game];
    },
    replay: function setModelSelectionReplay(ctxt, state, game) {
      var selection = gameModelSelectionService.set('remote', ctxt.after, state, game.model_selection);
      game = R.assoc('model_selection', selection, game);
      return game;
    },
    undo: function setModelSelectionUndo() {
      return self.Promise.reject('!!! ERROR : WE SHOULD NOT BE HERE !!!');
    }
  };
  commandsService.registerCommand('setModelSelection', setModelSelectionCommandService);
  return setModelSelectionCommandService;
}]);
//# sourceMappingURL=setModelSelection.js.map