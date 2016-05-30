(function() {
  angular.module('clickApp.services')
    .factory('createModelCommand', createModelCommandModelFactory);

  createModelCommandModelFactory.$inject = [
    'appData',
    'createElementCommand',
    'commands',
    'model',
    'gameModels',
    'gameModelSelection',
  ];
  function createModelCommandModelFactory(appDataService,
                                          createElementCommandModel,
                                          commandsModel,
                                          modelModel,
                                          gameModelsModel,
                                          gameModelSelectionModel) {
    const createModelCommandModel =
            createElementCommandModel('model',
                                      modelModel,
                                      gameModelsModel,
                                      gameModelSelectionModel,
                                      tryToCreateModel);
    commandsModel.registerCommand('createModel', createModelCommandModel);
    return createModelCommandModel;

    function tryToCreateModel(model) {
      const factions = appDataService.factions.sample();
      return modelModel
        .create(factions, model);
    }
  }
})();
