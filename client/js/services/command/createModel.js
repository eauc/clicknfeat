'use strict';

angular.module('clickApp.services')
  .factory('createModelCommand', [
    'commands',
    'model',
    'gameModels',
    'gameModelSelection',
    function createModelCommandServiceFactory(commandsService,
                                              modelService,
                                              gameModelsService,
                                              gameModelSelectionService) {
      var createModelCommandService = {
        execute: function createModelExecute(create, scope, game) {
          return R.pipeP(
            R.bind(self.Promise.resolve, self.Promise),
            R.prop('models'),
            R.map(function(model) {
              return R.pipe(
                R.assoc('x', create.base.x + model.x),
                R.assoc('y', create.base.y + model.y),
                R.assoc('r', create.base.r),
                function(model) {
                  return modelService.create(scope.factions, model)
                    .catch(R.always(null));
                }
              )(model);
            }),
            R.bind(self.Promise.all, self.Promise),
            R.reject(R.isNil),
            function(models) {
              if(R.isEmpty(models)) {
                return self.Promise.reject('No valid model definition');
              }
            
              var ctxt = {
                models: R.map(modelService.saveState, models),
                desc: models[0].state.info.join('.'),
              };
              return R.pipe(
                gameModelsService.add$(models),
                function(game_models) {
                  game.models = game_models;
              
                  return gameModelSelectionService.set('local',
                                                       R.map(R.path(['state','stamp']), models),
                                                       scope, game.model_selection);
                },
                function(selection) {
                  game.model_selection = selection;

                  scope.gameEvent('createModel');
                  return ctxt;
                }
              )(game.models);
            }
          )(create);
        },
        replay: function createModelReplay(ctxt, scope, game) {
          return R.pipeP(
            R.bind(self.Promise.resolve, self.Promise),
            R.prop('models'),
            R.map(function(model) {
              return modelService.create(scope.factions, model)
                .catch(R.always(null));
            }),
            R.bind(self.Promise.all, self.Promise),
            R.reject(R.isNil),
            function(models) {
              if(R.isEmpty(models)) {
                return self.Promise.reject('No valid model definition');
              }
              
              return R.pipe(
                gameModelsService.add$(models),
                function(game_models) {
                  game.models = game_models;
                  
                  return gameModelSelectionService.set('remote',
                                                       R.map(R.path(['state','stamp']), models),
                                                       scope, game.model_selection);
                },
                function(selection) {
                  game.model_selection = selection;
                  
                  scope.gameEvent('createModel');
                }
              )(game.models);
            }
          )(ctxt);
        },
        undo: function createModelUndo(ctxt, scope, game) {
          var stamps = R.map(R.prop('stamp'), ctxt.models);
          game.models = gameModelsService.removeStamps(stamps, game.models);
          game.model_selection =
            gameModelSelectionService.removeFrom('local', stamps,
                                                 scope, game.model_selection);
          game.model_selection =
            gameModelSelectionService.removeFrom('remote', stamps,
                                                 scope, game.model_selection);
          scope.gameEvent('createModel');
        }
      };
      commandsService.registerCommand('createModel', createModelCommandService);
      return createModelCommandService;
    }
  ]);
