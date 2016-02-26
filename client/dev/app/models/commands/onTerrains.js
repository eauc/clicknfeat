'use strict';

(function () {
  angular.module('clickApp.services').factory('onTerrainsCommand', onTerrainsCommandModelFactory);

  onTerrainsCommandModelFactory.$inject = ['onElementsCommand', 'commands', 'terrain', 'gameTerrains', 'gameTerrainSelection'];
  function onTerrainsCommandModelFactory(onElementsCommandModel, commandsModel, terrainModel, gameTerrainsModel, gameTerrainSelectionModel) {
    var onTerrainsCommandModel = onElementsCommandModel('terrain', terrainModel, gameTerrainsModel, gameTerrainSelectionModel);
    commandsModel.registerCommand('onTerrains', onTerrainsCommandModel);
    return onTerrainsCommandModel;
  }
})();
//# sourceMappingURL=onTerrains.js.map
