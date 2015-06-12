'use strict';

self.onModelsCommandServiceFactory = function onModelsCommandServiceFactory(commandsService,
                                                                            modelService,
                                                                            gameModelsService,
                                                                            gameModelSelectionService) {
  var onModelsCommandService = {
    execute: function onModelsExecute(method /* ...args..., stamps, scope, game */) {
      if('Function' !== R.type(modelService[method])) return;
      
      var args = Array.prototype.slice.call(arguments);
      var game = R.last(args);
      var scope = R.nth(-2, args);
      var stamps = R.nth(-3, args);
      var ctxt = {
        before: [],
        after: [],
        desc: method,
      };

      args = R.append(game.models, R.slice(0, -2, args));

      ctxt.before = gameModelsService.onStamps('saveState', stamps, game.models);
      gameModelsService.onStamps.apply(null, args);
      ctxt.after = gameModelsService.onStamps('saveState', stamps, game.models);

      R.forEach(function(stamp) {
        scope.gameEvent('changeModel-'+stamp);
      }, stamps);
      return ctxt;
    },
    replay: function onModelsRedo(ctxt, scope, game) {
      R.pipe(
        R.map(function(after) {
          return gameModelsService.findStamp(R.prop('stamp', after), game.models);
        }),
        R.forEachIndexed(function(model, index) {
          modelService.setState(ctxt.after[index], model);
          scope.gameEvent('changeModel-'+modelService.eventName(model));
        })
      )(ctxt.after);
      game.model_selection =
        gameModelSelectionService.set('remote', R.map(R.prop('stamp'), ctxt.after),
                                      scope, game.model_selection);
    },
    undo: function onModelsUndo(ctxt, scope, game) {
      R.pipe(
        R.map(function(before) {
          return gameModelsService.findStamp(R.prop('stamp', before), game.models);
        }),
        R.forEachIndexed(function(model, index) {
          modelService.setState(ctxt.before[index],model);
          scope.gameEvent('changeModel-'+modelService.eventName(model));
        })
      )(ctxt.before);
      game.model_selection =
        gameModelSelectionService.set('remote', R.map(R.prop('stamp'), ctxt.before),
                                      scope, game.model_selection);
    }
  };
  commandsService.registerCommand('onModels', onModelsCommandService);
  return onModelsCommandService;
};
