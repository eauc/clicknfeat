'use strict';

(function () {
  angular.module('clickApp.services').factory('onModelsCommand', onModelsCommandModelFactory);

  onModelsCommandModelFactory.$inject = ['onElementsCommand', 'commands', 'model', 'gameModels', 'gameModelSelection'];
  function onModelsCommandModelFactory(onElementsCommandModel, commandsModel, modelModel, gameModelsModel, gameModelSelectionModel) {
    var onModelsCommandModel = onElementsCommandModel('model', modelModel, gameModelsModel, gameModelSelectionModel, { checkIfModelRespondToMethod: true });
    commandsModel.registerCommand('onModels', onModelsCommandModel);
    return onModelsCommandModel;
  }
})();
//# sourceMappingURL=models.js.map
