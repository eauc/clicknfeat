'use strict';

angular.module('clickApp.services').factory('gameTerrainInfo', ['http', function gameTerrainInfoServiceFactory(httpService) {
  var gameTerrainInfoService = {
    init: function gameTerrainInfoInit() {
      return httpService.get('/data/terrains.json').catch(function (reason) {
        console.log('error getting terrains.json', reason);
        return [];
      }).then(updateTerrains);
    },
    getInfo: function gameTerrainInfoGetInfo(path, infos) {
      return new self.Promise(function (resolve, reject) {
        var info = R.path(path, infos);
        if (R.isNil(info)) reject('Terrain info ' + path.join('.') + ' not found');else resolve(info);
      });
    }
  };
  function updateTerrains(terrains) {
    return R.pipe(R.keys, R.sortBy(R.identity), R.reduce(function (mem, key) {
      mem[key] = updateAmbiance(terrains[key]);
      return mem;
    }, {}))(terrains);
  }
  function updateAmbiance(ambiance) {
    return R.pipe(R.keys, R.sortBy(R.identity), R.reduce(function (mem, key) {
      mem[key] = updateType(ambiance[key]);
      return mem;
    }, {}))(ambiance);
  }
  function updateType(type) {
    return R.pipe(R.keys, R.sortBy(R.identity), R.reduce(function (mem, key) {
      mem[key] = updateTerrain(type[key]);
      return mem;
    }, {}))(type);
  }
  function updateTerrain(terrain) {
    return R.pipe(R.assocPath(['img', 'width'], R.path(['img', 'width'], terrain) / 3), R.assocPath(['img', 'height'], R.path(['img', 'height'], terrain) / 3))(terrain);
  }
  R.curryService(gameTerrainInfoService);
  return gameTerrainInfoService;
}]);
//# sourceMappingURL=terrainInfo.js.map
