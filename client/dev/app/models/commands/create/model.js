'use strict';

angular.module('clickApp.services').factory('createModelCommand', ['commands', 'point', 'model', 'gameModels', 'gameModelSelection', function createModelCommandServiceFactory(commandsService, pointService, modelService, gameModelsService, gameModelSelectionService) {
  var createModelCommandService = {
    execute: function createModelExecute(create, is_flipped, state, game) {
      var add$ = pointService.addToWithFlip$(is_flipped);
      return R.pipePromise(R.prop('models'), R.map(function (model) {
        return R.pipe(add$(create.base), R.omit(['stamp']), function (model) {
          return modelService.create(state.factions, model).catch(R.always(null));
        })(model);
      }), R.promiseAll, R.reject(R.isNil), function (models) {
        if (R.isEmpty(models)) {
          return self.Promise.reject('No valid model definition');
        }

        var ctxt = {
          models: R.map(modelService.saveState, models),
          desc: models[0].state.info.join('.')
        };
        return R.pipe(gameModelsService.add$(models), function (game_models) {
          game = R.assoc('models', game_models, game);

          return gameModelSelectionService.set('local', R.map(R.path(['state', 'stamp']), models), state, game.model_selection);
        }, function (selection) {
          game = R.assoc('model_selection', selection, game);

          state.changeEvent('Game.model.create');

          return [ctxt, game];
        })(game.models);
      })(create);
    },
    replay: function createModelReplay(ctxt, state, game) {
      return R.pipePromise(R.prop('models'), R.map(function (model) {
        return modelService.create(state.factions, model).catch(R.always(null));
      }), R.promiseAll, R.reject(R.isNil), function (models) {
        if (R.isEmpty(models)) {
          return self.Promise.reject('No valid model definition');
        }

        return R.pipe(gameModelsService.add$(models), function (game_models) {
          game = R.assoc('models', game_models, game);

          return gameModelSelectionService.set('remote', R.map(R.path(['state', 'stamp']), models), state, game.model_selection);
        }, function (selection) {
          game = R.assoc('model_selection', selection, game);

          state.changeEvent('Game.model.create');

          return game;
        })(game.models);
      })(ctxt);
    },
    undo: function createModelUndo(ctxt, state, game) {
      var stamps = R.pluck('stamp', ctxt.models);
      game = R.pipe(R.over(R.lensProp('models'), gameModelsService.removeStamps$(stamps)), R.over(R.lensProp('model_selection'), gameModelSelectionService.removeFrom$('local', stamps, state)), R.over(R.lensProp('model_selection'), gameModelSelectionService.removeFrom$('remote', stamps, state)))(game);
      R.forEach(function (stamp) {
        state.changeEvent('Game.model.delete.' + stamp);
      }, stamps);
      state.changeEvent('Game.model.create');
      return game;
    }
  };
  commandsService.registerCommand('createModel', createModelCommandService);
  return createModelCommandService;
}]);
//# sourceMappingURL=model.js.map
