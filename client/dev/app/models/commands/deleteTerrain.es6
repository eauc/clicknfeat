(function() {
  angular.module('clickApp.models')
    .factory('deleteTerrainCommand', deleteTerrainCommandModelFactory);

  deleteTerrainCommandModelFactory.$inject = [
    'deleteElementCommand',
    'commands',
    'terrain',
    'gameTerrains',
    'gameTerrainSelection',
  ];
  function deleteTerrainCommandModelFactory(deleteElementCommandModel,
                                            commandsModel,
                                            terrainModel,
                                            gameTerrainsModel,
                                            gameTerrainSelectionModel) {
    const deleteTerrainCommandModel =
            deleteElementCommandModel('terrain',
                                      terrainModel,
                                      gameTerrainsModel,
                                      gameTerrainSelectionModel);
    commandsModel.registerCommand('deleteTerrain', deleteTerrainCommandModel);
    return deleteTerrainCommandModel;
  }
})();
