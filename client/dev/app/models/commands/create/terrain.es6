(function() {
  angular.module('clickApp.services')
    .factory('createTerrainCommand', createTerrainCommandModelFactory);

  createTerrainCommandModelFactory.$inject = [
    'appData',
    'createElementCommand',
    'commands',
    'terrain',
    'gameTerrains',
    'gameTerrainSelection',
  ];
  function createTerrainCommandModelFactory(appDataService,
                                            createElementCommandModel,
                                            commandsModel,
                                            terrainModel,
                                            gameTerrainsModel,
                                            gameTerrainSelectionModel) {
    const createTerrainCommandModel =
            createElementCommandModel('terrain',
                                      terrainModel,
                                      gameTerrainsModel,
                                      gameTerrainSelectionModel,
                                      tryToCreateTerrain);
    commandsModel.registerCommand('createTerrain', createTerrainCommandModel);
    return createTerrainCommandModel;

    function tryToCreateTerrain(terrain) {
      const terrains = appDataService.terrains.sample();
      return terrainModel
        .create(terrains, terrain);
    }
  }
})();
