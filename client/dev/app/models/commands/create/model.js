'use strict';

(function () {
  angular.module('clickApp.services').factory('createModelCommand', createModelCommandModelFactory);

  createModelCommandModelFactory.$inject = ['appData', 'createElementCommand', 'commands', 'model', 'gameModels', 'gameModelSelection'];
  function createModelCommandModelFactory(appDataService, createElementCommandModel, commandsModel, modelModel, gameModelsModel, gameModelSelectionModel) {
    var createModelCommandModel = createElementCommandModel('model', modelModel, gameModelsModel, gameModelSelectionModel, tryToCreateModel);
    commandsModel.registerCommand('createModel', createModelCommandModel);
    return createModelCommandModel;

    function tryToCreateModel(model) {
      var factions = appDataService.factions.sample();
      return modelModel.create(factions, model);
    }
  }
})();
//# sourceMappingURL=model.js.map
