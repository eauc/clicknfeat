'use strict';

self.lockModelsCommandServiceFactory = function lockModelsCommandServiceFactory(commandsService,
                                                                                gameModelsService) {
  var lockModelsCommandService = {
    execute: function lockModelsExecute(lock, stamps, scope, game) {
      var ctxt = {
        desc: lock,
        stamps: stamps,
      };

      game.models = gameModelsService.lockStamps(lock, stamps, game.models);

      R.forEach(function(stamp) {
        scope.gameEvent('changeModel-'+stamp);
      }, stamps);

      return ctxt;
    },
    replay: function lockModelsRedo(ctxt, scope, game) {
      game.models = gameModelsService.lockStamps(ctxt.desc, ctxt.stamps, game.models);
      R.forEach(function(stamp) {
        scope.gameEvent('changeModel-'+stamp);
      }, ctxt.stamps);
    },
    undo: function lockModelsUndo(ctxt, scope, game) {
      game.models = gameModelsService.lockStamps(!ctxt.desc, ctxt.stamps, game.models);
      R.forEach(function(stamp) {
        scope.gameEvent('changeModel-'+stamp);
      }, ctxt.stamps);
    }
  };
  commandsService.registerCommand('lockModels', lockModelsCommandService);
  return lockModelsCommandService;
};
