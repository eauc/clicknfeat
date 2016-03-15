'use strict';

(function () {
  angular.module('clickApp.services').factory('createModelCommand', createModelCommandModelFactory);

  createModelCommandModelFactory.$inject = ['createElementCommand', 'commands', 'model', 'gameModels', 'gameModelSelection'];
  function createModelCommandModelFactory(createElementCommandModel, commandsModel, modelModel, gameModelsModel, gameModelSelectionModel) {
    var createModelCommandModel = createElementCommandModel('model', modelModel, gameModelsModel, gameModelSelectionModel, tryToCreateModelP);
    commandsModel.registerCommand('createModel', createModelCommandModel);
    return createModelCommandModel;

    function tryToCreateModelP(state, model) {
      return modelModel.createP(state.factions, model).catch(R.always(null));
    }
  }
})();
//# sourceMappingURL=model.js.map
