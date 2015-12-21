'use strict';

angular.module('clickApp.services').factory('deleteModelCommand', ['commands', 'model', 'gameModels', 'gameModelSelection', function deleteModelCommandServiceFactory(commandsService, modelService, gameModelsService, gameModelSelectionService) {
  var deleteModelCommandService = {
    execute: function deleteModelExecute(stamps, scope, game) {
      return R.pipeP(function (stamps) {
        return gameModelsService.findAnyStamps(stamps, game.models);
      }, R.reject(R.isNil), R.map(modelService.saveState), function (states) {
        var ctxt = {
          models: states,
          desc: ''
        };
        return R.pipe(gameModelsService.removeStamps$(stamps), function (game_models) {
          game.models = game_models;

          return gameModelSelectionService.removeFrom('local', stamps, scope, game.model_selection);
        }, gameModelSelectionService.removeFrom$('remote', stamps, scope), function (selection) {
          game.model_selection = selection;

          scope.gameEvent('createModel');
          return ctxt;
        })(game.models);
      })(stamps);
    },
    replay: function deleteModelReplay(ctxt, scope, game) {
      return R.pipe(R.map(R.prop('stamp')), function (stamps) {
        return R.pipe(function () {
          return gameModelsService.removeStamps(stamps, game.models);
        }, function (game_models) {
          game.models = game_models;

          return gameModelSelectionService.removeFrom('local', stamps, scope, game.model_selection);
        }, gameModelSelectionService.removeFrom$('remote', stamps, scope), function (selection) {
          game.model_selection = selection;

          scope.gameEvent('createModel');
        })();
      })(ctxt.models);
    },
    undo: function deleteModelUndo(ctxt, scope, game) {
      return R.pipePromise(R.map(function (model) {
        return modelService.create(scope.factions, model).catch(R.always(null));
      }), R.promiseAll, R.reject(R.isNil), function (models) {
        if (R.isEmpty(models)) {
          return self.Promise.reject('No valid model definition');
        }

        return R.pipe(gameModelsService.add$(models), function (game_models) {
          game.models = game_models;

          var stamps = R.map(R.path(['state', 'stamp']), models);
          return gameModelSelectionService.set('remote', stamps, scope, game.model_selection);
        }, function (selection) {
          game.model_selection = selection;

          scope.gameEvent('createModel');
        })(game.models);
      })(ctxt.models);
    }
  };
  commandsService.registerCommand('deleteModel', deleteModelCommandService);
  return deleteModelCommandService;
}]);
//# sourceMappingURL=deleteModel.js.map
