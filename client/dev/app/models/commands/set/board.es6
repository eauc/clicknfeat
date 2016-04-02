(function() {
  angular.module('clickApp.services')
    .factory('setBoardCommand', setBoardCommandModelFactory);

  setBoardCommandModelFactory.$inject = [
    'commands',
  ];
  function setBoardCommandModelFactory(commandsService) {
    const setBoardCommandModel = {
      executeP: setBoardExecuteP,
      replayP: setBoardReplayP,
      undoP: setBoardUndoP
    };
    commandsService.registerCommand('setBoard', setBoardCommandModel);
    return setBoardCommandModel;

    function setBoardExecuteP(board, game) {
      const ctxt = {
        before: game.board,
        after: board,
        desc: board.name
      };
      game = R.assoc('board', board, game);
      return [ctxt, game];
    }
    function setBoardReplayP(ctxt, game) {
      game = R.assoc('board', ctxt.after, game);
      return game;
    }
    function setBoardUndoP(ctxt, game) {
      game = R.assoc('board', ctxt.before, game);
      return game;
    }
  }
})();
