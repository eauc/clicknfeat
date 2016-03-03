(function() {
  angular.module('clickApp.services')
    .factory('onTerrainsCommand', onTerrainsCommandModelFactory);

  onTerrainsCommandModelFactory.$inject = [
    'onElementsCommand',
    'commands',
    'terrain',
    'gameTerrains',
    'gameTerrainSelection',
  ];
  function onTerrainsCommandModelFactory(onElementsCommandModel,
                                         commandsModel,
                                         terrainModel,
                                         gameTerrainsModel,
                                         gameTerrainSelectionModel) {
    const onTerrainsCommandModel =
            onElementsCommandModel('terrain',
                                   terrainModel,
                                   gameTerrainsModel,
                                   gameTerrainSelectionModel);
    commandsModel.registerCommand('onTerrains', onTerrainsCommandModel);
    return onTerrainsCommandModel;
  }
})();
