'use strict';

angular.module('clickApp.services')
  .factory('gameTerrainInfo', [
    'http',
    function gameTerrainInfoServiceFactory(httpService) {
      var gameTerrainInfoService = {
        init: function gameTerrainInfoInit() {
          return httpService.get('/data/terrains.json')
            .catch(function(reason) {
              console.log('error getting terrains.json', reason);
              return [];
            });
        },
        getInfo: function gameTerrainInfoGetInfo(path, infos) {
          return new self.Promise((resolve, reject) => {
            var info = R.path(path, infos);
            if(R.isNil(info)) reject('Terrain info '+path.join('.')+' not found');
            else resolve(info);
          });
        },
      };
      R.curryService(gameTerrainInfoService);
      return gameTerrainInfoService;
    }
  ]);
