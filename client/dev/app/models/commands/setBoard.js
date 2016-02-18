'use strict';

(function () {
  angular.module('clickApp.services').factory('setBoardCommand', setBoardCommandModelFactory);

  setBoardCommandModelFactory.$inject = ['commands'];
  function setBoardCommandModelFactory(commandsService) {
    var setBoardCommandModel = {
      executeP: setBoardExecuteP,
      replayP: setBoardReplayP,
      undoP: setBoardUndoP
    };

    commandsService.registerCommand('setBoard', setBoardCommandModel);
    return setBoardCommandModel;

    function setBoardExecuteP(board, state, game) {
      var ctxt = {
        before: game.board,
        after: board,
        desc: board.name
      };
      game = R.assoc('board', board, game);

      state.queueChangeEventP('Game.board.change');

      return [ctxt, game];
    }
    function setBoardReplayP(ctxt, state, game) {
      game = R.assoc('board', ctxt.after, game);

      state.queueChangeEventP('Game.board.change');

      return game;
    }
    function setBoardUndoP(ctxt, state, game) {
      game = R.assoc('board', ctxt.before, game);

      state.queueChangeEventP('Game.board.change');

      return game;
    }
  }
})();
//# sourceMappingURL=setBoard.js.map
