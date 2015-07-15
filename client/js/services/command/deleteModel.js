'use strict';

self.deleteModelCommandServiceFactory =
  function deleteModelCommandServiceFactory(commandsService,
                                            modelService,
                                            gameModelsService,
                                            gameModelSelectionService) {
    var deleteModelCommandService = {
      execute: function deleteModelExecute(stamps, scope, game) {
        var states = R.pipe(
          R.map(function(stamp) {
            return gameModelsService.findStamp(stamp, game.models);
          }),
          R.reject(R.isNil),
          R.map(modelService.saveState)
        )(stamps);
        if(R.isEmpty(states)) return;
        console.log(states);
        
        var ctxt = {
          models: states,
          desc: '',
        };
        game.models = gameModelsService.removeStamps(stamps, game.models);
        game.model_selection =
          gameModelSelectionService.removeFrom('local', stamps,
                                               scope, game.model_selection);
        game.model_selection =
          gameModelSelectionService.removeFrom('remote', stamps,
                                               scope, game.model_selection);
        scope.gameEvent('createModel');
        return ctxt;
      },
      replay: function deleteModelReplay(ctxt, scope, game) {
        var stamps = R.map(R.prop('stamp'), ctxt.models);
        game.models = gameModelsService.removeStamps(stamps, game.models);
        game.model_selection =
          gameModelSelectionService.removeFrom('local', stamps,
                                               scope, game.model_selection);
        game.model_selection =
          gameModelSelectionService.removeFrom('remote', stamps,
                                               scope, game.model_selection);
        scope.gameEvent('createModel');
      },
      undo: function deleteModelUndo(ctxt, scope, game) {
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
      }
    };
    commandsService.registerCommand('deleteModel', deleteModelCommandService);
    return deleteModelCommandService;
  };
