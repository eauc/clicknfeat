'use strict';

(function () {
  angular.module('clickApp.services').factory('lockModelsCommand', lockModelsCommandModelFactory);

  lockModelsCommandModelFactory.$inject = ['lockElementsCommand', 'commands', 'gameModels'];
  function lockModelsCommandModelFactory(lockElementsCommandModel, commandsModel, gameModelsModel) {
    var lockModelsCommandModel = lockElementsCommandModel('model', gameModelsModel);
    commandsModel.registerCommand('lockModels', lockModelsCommandModel);
    return lockModelsCommandModel;
  }
})();
//# sourceMappingURL=models.js.map
