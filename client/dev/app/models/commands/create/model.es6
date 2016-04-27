(function() {
  angular.module('clickApp.services')
    .factory('createModelCommand', createModelCommandModelFactory);

  createModelCommandModelFactory.$inject = [
    'appState',
    'createElementCommand',
    'commands',
    'model',
    'gameModels',
    'gameModelSelection',
  ];
  function createModelCommandModelFactory(appStateService,
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
      const state = appStateService.current();
      return modelModel
        .create(state.factions, model);
    }
  }
})();
