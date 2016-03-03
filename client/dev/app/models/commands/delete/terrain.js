'use strict';

(function () {
  angular.module('clickApp.models').factory('deleteTerrainCommand', deleteTerrainCommandModelFactory);

  deleteTerrainCommandModelFactory.$inject = ['deleteElementCommand', 'commands', 'terrain', 'gameTerrains', 'gameTerrainSelection'];
  function deleteTerrainCommandModelFactory(deleteElementCommandModel, commandsModel, terrainModel, gameTerrainsModel, gameTerrainSelectionModel) {
    var deleteTerrainCommandModel = deleteElementCommandModel('terrain', terrainModel, gameTerrainsModel, gameTerrainSelectionModel);
    commandsModel.registerCommand('deleteTerrain', deleteTerrainCommandModel);
    return deleteTerrainCommandModel;
  }
})();
//# sourceMappingURL=terrain.js.map
