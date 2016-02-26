'use strict';

(function () {
  angular.module('clickApp.services').factory('gameTerrains', gameTerrainsModelFactory);

  gameTerrainsModelFactory.$inject = ['terrain', 'gameElements'];
  function gameTerrainsModelFactory(terrainModel, gameElementsModel) {
    return gameElementsModel('terrain', terrainModel);
  }
})();
//# sourceMappingURL=terrains.js.map
