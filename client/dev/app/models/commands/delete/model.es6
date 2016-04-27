(function() {
  angular.module('clickApp.services')
    .factory('deleteModelCommand', deleteModelCommandModelFactory);

  deleteModelCommandModelFactory.$inject = [
    'appState',
    'deleteElementCommand',
    'commands',
    'model',
    'gameModels',
    'gameModelSelection',
  ];
  function deleteModelCommandModelFactory(appStateService,
                                          deleteElementCommandModel,
                                          commandsModel,
                                          modelModel,
                                          gameModelsModel,
                                          gameModelSelectionModel) {
    const deleteModelCommandModel =
            deleteElementCommandModel('model',
                                      modelModel,
                                      gameModelsModel,
                                      gameModelSelectionModel,
                                      tryToCreateModel);
    commandsModel.registerCommand('deleteModel', deleteModelCommandModel);
    return deleteModelCommandModel;

    function tryToCreateModel(model) {
      const state = appStateService.current();
      return modelModel
        .create(state.factions, model);
    }
  }
})();
