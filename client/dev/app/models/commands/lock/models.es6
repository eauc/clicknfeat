(function() {
  angular.module('clickApp.services')
    .factory('lockModelsCommand', lockModelsCommandModelFactory);

  lockModelsCommandModelFactory.$inject = [
    'lockElementsCommand',
    'commands',
    'gameModels',
  ];
  function lockModelsCommandModelFactory(lockElementsCommandModel,
                                         commandsModel,
                                         gameModelsModel) {
    const lockModelsCommandModel =
            lockElementsCommandModel('model',
                                     gameModelsModel);
    commandsModel.registerCommand('lockModels', lockModelsCommandModel);
    return lockModelsCommandModel;
  }
})();
