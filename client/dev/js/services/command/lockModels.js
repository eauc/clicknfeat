'use strict';

angular.module('clickApp.services').factory('lockModelsCommand', ['commands', 'gameModels', function lockModelsCommandServiceFactory(commandsService, gameModelsService) {
  var lockModelsCommandService = {
    execute: function lockModelsExecute(lock, stamps, scope, game) {
      var ctxt = {
        desc: lock,
        stamps: stamps
      };

      return R.pipeP(gameModelsService.lockStamps$(lock, stamps), function (game_models) {
        game.models = game_models;

        R.forEach(function (stamp) {
          scope.gameEvent('changeModel-' + stamp);
        }, stamps);

        return ctxt;
      })(game.models);
    },
    replay: function lockModelsRedo(ctxt, scope, game) {
      return R.pipeP(gameModelsService.lockStamps$(ctxt.desc, ctxt.stamps), function (game_models) {
        game.models = game_models;

        R.forEach(function (stamp) {
          scope.gameEvent('changeModel-' + stamp);
        }, ctxt.stamps);
      })(game.models);
    },
    undo: function lockModelsUndo(ctxt, scope, game) {
      return R.pipeP(gameModelsService.lockStamps$(!ctxt.desc, ctxt.stamps), function (game_models) {
        game.models = game_models;

        R.forEach(function (stamp) {
          scope.gameEvent('changeModel-' + stamp);
        }, ctxt.stamps);
      })(game.models);
    }
  };
  commandsService.registerCommand('lockModels', lockModelsCommandService);
  return lockModelsCommandService;
}]);
//# sourceMappingURL=lockModels.js.map