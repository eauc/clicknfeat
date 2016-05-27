'use strict';

(function () {
  angular.module('clickApp.services').factory('gameTerrainInfo', gameTerrainInfoModelFactory);

  gameTerrainInfoModelFactory.$inject = ['appError', 'http'];
  function gameTerrainInfoModelFactory(appErrorService, httpService) {
    var gameTerrainInfoModel = {
      initP: gameTerrainInfoInitP,
      getInfo: gameTerrainInfoGetInfo
    };

    R.curryService(gameTerrainInfoModel);
    return gameTerrainInfoModel;

    function gameTerrainInfoInitP() {
      return httpService.getP('/data/terrains.json').catch(function (error) {
        appErrorService.emit('Error getting terrains.json', error);
      }).then(updateTerrains);
    }
    function gameTerrainInfoGetInfo(path, infos) {
      return R.pathOr(null, path, infos);
    }
    function updateTerrains(terrains) {
      return R.thread(terrains)(R.keys, R.sortBy(R.identity), R.reduce(function (mem, key) {
        mem[key] = updateAmbiance(terrains[key]);
        return mem;
      }, {}));
    }
    function updateAmbiance(ambiance) {
      return R.thread(ambiance)(R.keys, R.sortBy(R.identity), R.reduce(function (mem, key) {
        mem[key] = updateType(ambiance[key]);
        return mem;
      }, {}));
    }
    function updateType(type) {
      return R.thread(type)(R.keys, R.sortBy(R.identity), R.reduce(function (mem, key) {
        mem[key] = updateTerrain(type[key]);
        return mem;
      }, {}));
    }
    function updateTerrain(terrain) {
      return R.thread(terrain)(R.over(R.lensPath(['img', 'width']), R.divide(R.__, 3)), R.over(R.lensPath(['img', 'height']), R.divide(R.__, 3)));
    }
  }
})();
//# sourceMappingURL=terrainInfo.js.map
