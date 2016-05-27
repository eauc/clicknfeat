(function() {
  angular.module('clickApp.services')
    .factory('gameTerrains', gameTerrainsModelFactory);

  gameTerrainsModelFactory.$inject = [
    'terrain',
    'gameElements',
  ];
  function gameTerrainsModelFactory(terrainModel,
                                    gameElementsModel) {
    const base = gameElementsModel('terrain', terrainModel);
    const gameTerrainsModel = Object.create(base);
    R.deepExtend(gameTerrainsModel, {
      copyAll: gameTerrainsCopyAll
    });

    R.curryService(gameTerrainsModel);
    return gameTerrainsModel;

    function gameTerrainsCopyAll(terrains) {
      return R.thread(terrains)(
        gameTerrainsModel.all,
        R.pluck('state'),
        R.map(R.pick(['x','y','r','info','lk']))
      );
    }
  }
})();
