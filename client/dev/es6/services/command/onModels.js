angular.module('clickApp.services')
  .factory('onModelsCommand', [
    'commands',
    'model',
    'gameModels',
    'gameModelSelection',
    function onModelsCommandServiceFactory(commandsService,
                                           modelService,
                                           gameModelsService,
                                           gameModelSelectionService) {
      var onModelsCommandService = {
        execute: function onModelsExecute(method, args, stamps, state, game) {
          if('Function' !== R.type(modelService[method])) {
            return self.Promise
              .reject(`Unknown method ${method} on model`);
          }
          
          var ctxt = {
            before: [],
            after: [],
            desc: method
          };

          return R.pipeP(
            gameModelsService.fromStamps$('saveState', [], stamps),
            (before) => {
              ctxt.before = before;
              
              return gameModelsService
                .onStamps(method, args, stamps, game.models);
            },
            (models) => {
              game = R.assoc('models', models, game);
              
              return gameModelsService
                .fromStamps('saveState', [], stamps, game.models);
            },
            (after) => {
              ctxt.after = after;

              R.forEach((stamp) => {
                state.changeEvent(`Game.model.change.${stamp}`);
              }, stamps);
              
              return [ctxt, game];
            }
          )(game.models);
        },
        replay: function onModelsRedo(ctxt, state, game) {
          var stamps = R.pluck('stamp', ctxt.after);
          return R.pipeP(
            gameModelsService.setStateStamps$(ctxt.after, stamps),
            (models) => {
              game = R.assoc('models', models, game);

              return gameModelSelectionService
                .set('remote', stamps, state, game.model_selection);
            },
            (selection) => {
              game = R.assoc('model_selection', selection, game);

              R.forEach((stamp) => {
                state.changeEvent(`Game.model.change.${stamp}`);
              }, stamps);
              
              return game;
            }
          )(game.models);
        },
        undo: function onModelsUndo(ctxt, state, game) {
          var stamps = R.pluck('stamp', ctxt.before);
          return R.pipeP(
            gameModelsService.setStateStamps$(ctxt.before, stamps),
            (models) => {
              game = R.assoc('models', models, game);

              return gameModelSelectionService
                .set('remote', stamps, state, game.model_selection);
            },
            (selection) => {
              game = R.assoc('model_selection', selection, game);

              R.forEach((stamp) => {
                state.changeEvent(`Game.model.change.${stamp}`);
              }, stamps);
              
              return game;
            }
          )(game.models);
        }
      };
      commandsService.registerCommand('onModels', onModelsCommandService);
      return onModelsCommandService;
    }
  ]);
