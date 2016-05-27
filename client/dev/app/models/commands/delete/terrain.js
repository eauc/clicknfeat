'use strict';

(function () {
  angular.module('clickApp.models').factory('deleteTerrainCommand', deleteTerrainCommandModelFactory);

  deleteTerrainCommandModelFactory.$inject = ['appData', 'deleteElementCommand', 'commands', 'terrain', 'gameTerrains', 'gameTerrainSelection'];
  function deleteTerrainCommandModelFactory(appDataService, deleteElementCommandModel, commandsModel, terrainModel, gameTerrainsModel, gameTerrainSelectionModel) {
    var deleteTerrainCommandModel = deleteElementCommandModel('terrain', terrainModel, gameTerrainsModel, gameTerrainSelectionModel, tryToCreateTerrain);
    commandsModel.registerCommand('deleteTerrain', deleteTerrainCommandModel);
    return deleteTerrainCommandModel;

    function tryToCreateTerrain(terrain) {
      var terrains = appDataService.terrains.sample();
      return terrainModel.create(terrains, terrain);
    }
  }
})();
//# sourceMappingURL=terrain.js.map
