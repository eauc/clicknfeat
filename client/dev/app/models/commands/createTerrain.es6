(function() {
  angular.module('clickApp.services')
    .factory('createTerrainCommand', createTerrainCommandModelFactory);

  createTerrainCommandModelFactory.$inject = [
    'createElementCommand',
    'commands',
    'terrain',
    'gameTerrains',
    'gameTerrainSelection',
  ];
  function createTerrainCommandModelFactory(createElementCommandModel,
                                            commandsModel,
                                            terrainModel,
                                            gameTerrainsModel,
                                            gameTerrainSelectionModel) {
    const createTerrainCommandModel =
            createElementCommandModel('terrain',
                                      terrainModel,
                                      gameTerrainsModel,
                                      gameTerrainSelectionModel);
    commandsModel.registerCommand('createTerrain', createTerrainCommandModel);
    return createTerrainCommandModel;
  }
})();
