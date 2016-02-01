'use strict';

angular.module('clickApp.services')
  .factory('setBoardCommand', [
    'commands',
    function setBoardCommandServiceFactory(commandsService) {
      var setBoardCommandService = {
        execute: function setBoardExecute(board, state, game) {
          var ctxt = {
            before: game.board,
            after: board,
            desc: board.name
          };
          game = R.assoc('board', board, game);

          state.changeEvent('Game.board.change');

          return [ctxt, game];
        },
        replay: function setBoardRedo(ctxt, state, game) {
          game = R.assoc('board', ctxt.after, game);

          state.changeEvent('Game.board.change');

          return game;
        },
        undo: function setBoardUndo(ctxt, state, game) {
          game = R.assoc('board', ctxt.before, game);
          
          state.changeEvent('Game.board.change');

          return game;
        }
      };
      commandsService.registerCommand('setBoard', setBoardCommandService);
      return setBoardCommandService;
    }
  ]);
