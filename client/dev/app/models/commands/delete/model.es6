(function() {
  angular.module('clickApp.services')
    .factory('deleteModelCommand', deleteModelCommandModelFactory);

  deleteModelCommandModelFactory.$inject = [
    'deleteElementCommand',
    'commands',
    'model',
    'gameModels',
    'gameModelSelection',
  ];
  function deleteModelCommandModelFactory(deleteElementCommandModel,
                                          commandsModel,
                                          modelModel,
                                          gameModelsModel,
                                          gameModelSelectionModel) {
    const deleteModelCommandModel =
            deleteElementCommandModel('model',
                                      modelModel,
                                      gameModelsModel,
                                      gameModelSelectionModel,
                                      tryToCreateModelP);
    commandsModel.registerCommand('deleteModel', deleteModelCommandModel);
    return deleteModelCommandModel;

    function tryToCreateModelP(state, model) {
      return modelModel
        .createP(state.factions, model)
        .catch(R.always(null));
    }
  }
})();
