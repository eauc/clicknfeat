(function() {
  angular.module('clickApp.models')
    .factory('deleteTerrainCommand', deleteTerrainCommandModelFactory);

  deleteTerrainCommandModelFactory.$inject = [
    'appData',
    'deleteElementCommand',
    'commands',
    'terrain',
    'gameTerrains',
    'gameTerrainSelection',
  ];
  function deleteTerrainCommandModelFactory(appDataService,
                                            deleteElementCommandModel,
                                            commandsModel,
                                            terrainModel,
                                            gameTerrainsModel,
                                            gameTerrainSelectionModel) {
    const deleteTerrainCommandModel =
            deleteElementCommandModel('terrain',
                                      terrainModel,
                                      gameTerrainsModel,
                                      gameTerrainSelectionModel,
                                      tryToCreateTerrain);
    commandsModel.registerCommand('deleteTerrain', deleteTerrainCommandModel);
    return deleteTerrainCommandModel;

    function tryToCreateTerrain(terrain) {
      const terrains = appDataService.terrains.sample();
      return terrainModel
        .create(terrains, terrain);
    }
  }
})();
