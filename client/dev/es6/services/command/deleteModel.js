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
        execute: function deleteModelExecute(stamps, scope, game) {
          return R.pipeP(
            (stamps) => {
              return gameModelsService.findAnyStamps(stamps, game.models);
            },
            R.spy('find any'),
            R.reject(R.isNil),
            R.spy('not nil'),
            R.map(modelService.saveState),
            R.spy('save'),
            (states) => {
              var ctxt = {
                models: states,
                desc: '',
              };
              return R.pipe(
                gameModelsService.removeStamps$(stamps),
                (game_models) => {
                  game.models = game_models;

                  return gameModelSelectionService
                    .removeFrom('local', stamps, scope, game.model_selection);
                },
                gameModelSelectionService.removeFrom$('remote', stamps, scope),
                (selection) => {
                  game.model_selection = selection;
                  
                  scope.gameEvent('createModel');
                  return ctxt;
                }
              )(game.models);
            }
          )(stamps);
        },
        replay: function deleteModelReplay(ctxt, scope, game) {
          return R.pipe(
            R.map(R.prop('stamp')),
            (stamps) => {
              return R.pipe(
                () => {
                  return gameModelsService.removeStamps(stamps, game.models);
                },
                (game_models) => {
                  game.models = game_models;

                  return gameModelSelectionService
                    .removeFrom('local', stamps, scope, game.model_selection);
                },
                gameModelSelectionService.removeFrom$('remote', stamps, scope),
                (selection) => {
                  game.model_selection = selection;
                  
                  scope.gameEvent('createModel');
                }
              )();
            }
          )(ctxt.models);
        },
        undo: function deleteModelUndo(ctxt, scope, game) {
          return R.pipePromise(
            R.map((model) => {
              return modelService.create(scope.factions, model)
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
                  game.models = game_models;

                  var stamps = R.map(R.path(['state','stamp']), models);
                  return gameModelSelectionService
                    .set('remote', stamps, scope, game.model_selection);
                },
                (selection) => {
                  game.model_selection = selection;
                  
                  scope.gameEvent('createModel');
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
