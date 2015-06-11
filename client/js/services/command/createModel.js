'use strict';

self.createModelCommandServiceFactory =
  function createModelCommandServiceFactory(commandsService,
                                            modelService,
                                            gameModelsService,
                                            gameModelSelectionService) {
    var createModelCommandService = {
      execute: function createModelExecute(create, scope, game) {
        var models = R.pipe(
          R.map(function(model) {
            return R.pipe(
              R.assoc('x', create.base.x + model.x),
              R.assoc('y', create.base.y + model.y),
              modelService.create$(scope.factions)
            )(model);
          }),
          R.reject(R.isNil)
        )(create.models);
        if(R.isEmpty(models)) return;

        var ctxt = {
          models: R.map(modelService.saveState, models),
          desc: models[0].state.info.join('.'),
        };
        game.models = gameModelsService.add(models, game.models);
        game.model_selection =
          gameModelSelectionService.set('local', R.map(R.path(['state','stamp']), models),
                                        scope, game.model_selection);
        scope.gameEvent('createModel');
        return ctxt;
      },
      replay: function createModelReplay(ctxt, scope, game) {
        var models = R.pipe(
          R.map(modelService.create$(scope.factions)),
          R.reject(R.isNil)
        )(ctxt.models);
        if(R.isEmpty(models)) return;

        game.models = gameModelsService.add(models, game.models);
        game.model_selection =
          gameModelSelectionService.set('remote', R.map(R.path(['state','stamp']), models),
                                        scope, game.model_selection);
        scope.gameEvent('createModel');
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
  };
