(function() {
  angular.module('clickApp.services')
    .factory('gameTerrainInfo', gameTerrainInfoModelFactory);

  gameTerrainInfoModelFactory.$inject = [
    'http',
  ];
  function gameTerrainInfoModelFactory(httpService) {
    const gameTerrainInfoModel = {
      initP: gameTerrainInfoInitP,
      getInfoP: gameTerrainInfoGetInfoP
    };

    R.curryService(gameTerrainInfoModel);
    return gameTerrainInfoModel;

    function gameTerrainInfoInitP() {
      return R.thread('/data/terrains.json')(
        httpService.getP,
        R.condErrorP([
          [ R.T, (reason) => {
            console.error('Error getting terrains.json', reason);
            return [];
          } ]
        ]),
        updateTerrainsP
      );
    }
    function gameTerrainInfoGetInfoP(path, infos) {
      return new self.Promise((resolve, reject) => {
        var info = R.path(path, infos);
        if(R.isNil(info)) reject(`Terrain info "${path.join('.')}" not found`);
        else resolve(info);
      });
    }
    function updateTerrainsP(terrains) {
      return R.threadP(terrains)(
        updateTerrains
      );
    }
    function updateTerrains(terrains) {
      return R.thread(terrains)(
        R.keys,
        R.sortBy(R.identity),
        R.reduce((mem, key) => {
          mem[key] = updateAmbiance(terrains[key]);
          return mem;
        }, {})
      );
    }
    function updateAmbiance(ambiance) {
      return R.thread(ambiance)(
        R.keys,
        R.sortBy(R.identity),
        R.reduce((mem, key) => {
          mem[key] = updateType(ambiance[key]);
          return mem;
        }, {})
      );
    }
    function updateType(type) {
      return R.thread(type)(
        R.keys,
        R.sortBy(R.identity),
        R.reduce((mem, key) => {
          mem[key] = updateTerrain(type[key]);
          return mem;
        }, {})
      );
    }
    function updateTerrain(terrain) {
      return R.thread(terrain)(
        R.over(R.lensPath(['img','width']), R.divide(R.__, 3)),
        R.over(R.lensPath(['img','height']), R.divide(R.__, 3))
      );
    }
  }
})();
