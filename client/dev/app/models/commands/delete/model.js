'use strict';

(function () {
  angular.module('clickApp.services').factory('deleteModelCommand', deleteModelCommandModelFactory);

  deleteModelCommandModelFactory.$inject = ['appData', 'deleteElementCommand', 'commands', 'model', 'gameModels', 'gameModelSelection'];
  function deleteModelCommandModelFactory(appDataService, deleteElementCommandModel, commandsModel, modelModel, gameModelsModel, gameModelSelectionModel) {
    var deleteModelCommandModel = deleteElementCommandModel('model', modelModel, gameModelsModel, gameModelSelectionModel, tryToCreateModel);
    commandsModel.registerCommand('deleteModel', deleteModelCommandModel);
    return deleteModelCommandModel;

    function tryToCreateModel(model) {
      var factions = appDataService.factions.sample();
      return modelModel.create(factions, model);
    }
  }
})();
//# sourceMappingURL=model.js.map
