'use strict';

angular.module('clickApp.services')
  .factory('lockModelsCommand', [
    'commands',
    'gameModels',
    function lockModelsCommandServiceFactory(commandsService,
                                             gameModelsService) {
      var lockModelsCommandService = {
        execute: function lockModelsExecute(lock, stamps, state, game) {
          var ctxt = {
            desc: lock,
            stamps: stamps
          };

          return R.pipeP(
            gameModelsService.lockStamps$(lock, stamps),
            function(game_models) {
              game = R.assoc('models', game_models, game);

              R.forEach((stamp) => {
                state.changeEvent(`Game.model.change.${stamp}`);
              }, stamps);
              
              return [ctxt, game];
            }
          )(game.models);
        },
        replay: function lockModelsRedo(ctxt, state, game) {
          return R.pipeP(
            gameModelsService.lockStamps$(ctxt.desc, ctxt.stamps),
            function(game_models) {
              game = R.assoc('models', game_models, game);
              
              R.forEach((stamp) => {
                state.changeEvent(`Game.model.change.${stamp}`);
              }, ctxt.stamps);

              return game;
            }
          )(game.models);
        },
        undo: function lockModelsUndo(ctxt, state, game) {
          return R.pipeP(
            gameModelsService.lockStamps$(!ctxt.desc, ctxt.stamps),
            function(game_models) {
              game = R.assoc('models', game_models, game);
              
              R.forEach((stamp) => {
                state.changeEvent(`Game.model.change.${stamp}`);
              }, ctxt.stamps);

              return game;
            }
          )(game.models);
        }
      };
      commandsService.registerCommand('lockModels', lockModelsCommandService);
      return lockModelsCommandService;
    }
  ]);
