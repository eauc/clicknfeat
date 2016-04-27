'use strict';

(function () {
  angular.module('clickApp.services').factory('deleteModelCommand', deleteModelCommandModelFactory);

  deleteModelCommandModelFactory.$inject = ['appState', 'deleteElementCommand', 'commands', 'model', 'gameModels', 'gameModelSelection'];
  function deleteModelCommandModelFactory(appStateService, deleteElementCommandModel, commandsModel, modelModel, gameModelsModel, gameModelSelectionModel) {
    var deleteModelCommandModel = deleteElementCommandModel('model', modelModel, gameModelsModel, gameModelSelectionModel, tryToCreateModel);
    commandsModel.registerCommand('deleteModel', deleteModelCommandModel);
    return deleteModelCommandModel;

    function tryToCreateModel(model) {
      var state = appStateService.current();
      return modelModel.create(state.factions, model);
    }
  }
})();
//# sourceMappingURL=model.js.map
