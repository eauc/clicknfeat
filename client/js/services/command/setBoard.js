'use strict';

self.setBoardCommandServiceFactory = function setBoardCommandServiceFactory(commandsService) {
  var setBoardCommandService = {
    execute: function setBoardExecute(board, scope, game) {
      var ctxt = {
        before: game.board,
        after: board,
        desc: board.name,
      };
      game.board = board;
      scope.gameEvent('changeBoard');
      return ctxt;
    },
    replay: function setBoardRedo(ctxt, scope, game) {
      game.board = ctxt.after;
      scope.gameEvent('changeBoard');
    },
    undo: function setBoardUndo(ctxt, scope, game) {
      game.board = ctxt.before;
      scope.gameEvent('changeBoard');
    }
  };
  commandsService.registerCommand('setBoard', setBoardCommandService);
  return setBoardCommandService;
};
