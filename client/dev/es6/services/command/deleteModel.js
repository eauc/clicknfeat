angular.module('clickApp.services')
  .factory('deleteModelCommand', [
    'commands',
    'model',
    'gameModels',
    'gameModelSelection',
    function deleteModelCommandServiceFactory(commandsService,
                                              modelService,
                                              gameModelsService,
                                              gameModelSelectionService) {
      var deleteModelCommandService = {
        execute: function deleteModelExecute(stamps, state, game) {
          return R.pipeP(
            (stamps) => {
              return gameModelsService.findAnyStamps(stamps, game.models);
            },
            R.reject(R.isNil),
            R.map(modelService.saveState),
            (states) => {
              var ctxt = {
                models: states,
                desc: ''
              };
              return R.pipe(
                gameModelsService.removeStamps$(stamps),
                (game_models) => {
                  game = R.assoc('models', game_models, game);

                  return gameModelSelectionService
                    .removeFrom('local', stamps, state, game.model_selection);
                },
                gameModelSelectionService.removeFrom$('remote', stamps, state),
                (selection) => {
                  game = R.assoc('model_selection', selection, game);
                  
                  R.forEach((stamp) => {
                    state.changeEvent(`Game.model.delete.${stamp}`);
                  }, stamps);
                  state.changeEvent('Game.model.create');

                  return [ctxt, game];
                }
              )(game.models);
            }
          )(stamps);
        },
        replay: function deleteModelReplay(ctxt, state, game) {
          return R.pipe(
            R.pluck('stamp'),
            (stamps) => {
              return R.pipe(
                () => {
                  return gameModelsService.removeStamps(stamps, game.models);
                },
                (game_models) => {
                  game = R.assoc('models', game_models, game);

                  return gameModelSelectionService
                    .removeFrom('local', stamps, state, game.model_selection);
                },
                gameModelSelectionService.removeFrom$('remote', stamps, state),
                (selection) => {
                  game = R.assoc('model_selection', selection, game);
                  
                  R.forEach((stamp) => {
                    state.changeEvent(`Game.model.delete.${stamp}`);
                  }, stamps);
                  state.changeEvent('Game.model.create');

                  return game;
                }
              )();
            }
          )(ctxt.models);
        },
        undo: function deleteModelUndo(ctxt, state, game) {
          return R.pipePromise(
            R.map((model) => {
              return modelService.create(state.factions, model)
                .catch(R.always(null));
            }),
            R.promiseAll,
            R.reject(R.isNil),
            (models) => {
              if(R.isEmpty(models)) {
                return self.Promise.reject('No valid model definition');
              }
              
              return R.pipe(
                gameModelsService.add$(models),
                (game_models) => {
                  game = R.assoc('models', game_models, game);

                  var stamps = R.map(R.path(['state','stamp']), models);
                  return gameModelSelectionService
                    .set('remote', stamps, state, game.model_selection);
                },
                (selection) => {
                  game = R.assoc('model_selection', selection, game);
                  
                  state.changeEvent('Game.model.create');

                  return game;
                }
              )(game.models);
            }
          )(ctxt.models);
        }
      };
      commandsService.registerCommand('deleteModel', deleteModelCommandService);
      return deleteModelCommandService;
    }
  ]);
