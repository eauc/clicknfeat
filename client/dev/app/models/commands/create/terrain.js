'use strict';

(function () {
  angular.module('clickApp.services').factory('createTerrainCommand', createTerrainCommandModelFactory);

  createTerrainCommandModelFactory.$inject = ['appData', 'createElementCommand', 'commands', 'terrain', 'gameTerrains', 'gameTerrainSelection'];
  function createTerrainCommandModelFactory(appDataService, createElementCommandModel, commandsModel, terrainModel, gameTerrainsModel, gameTerrainSelectionModel) {
    var createTerrainCommandModel = createElementCommandModel('terrain', terrainModel, gameTerrainsModel, gameTerrainSelectionModel, tryToCreateTerrain);
    commandsModel.registerCommand('createTerrain', createTerrainCommandModel);
    return createTerrainCommandModel;

    function tryToCreateTerrain(terrain) {
      var terrains = appDataService.terrains.sample();
      return terrainModel.create(terrains, terrain);
    }
  }
})();
//# sourceMappingURL=terrain.js.map
