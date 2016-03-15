(function() {
  angular.module('clickApp.services')
    .factory('onModelsCommand', onModelsCommandModelFactory);

  onModelsCommandModelFactory.$inject = [
    'onElementsCommand',
    'commands',
    'model',
    'gameModels',
    'gameModelSelection',
  ];
  function onModelsCommandModelFactory(onElementsCommandModel,
                                       commandsModel,
                                       modelModel,
                                       gameModelsModel,
                                       gameModelSelectionModel) {
    const onModelsCommandModel =
            onElementsCommandModel('model',
                                   modelModel,
                                   gameModelsModel,
                                   gameModelSelectionModel,
                                   { checkIfModelRespondToMethod: true });
    commandsModel.registerCommand('onModels', onModelsCommandModel);
    return onModelsCommandModel;
  }
})();
