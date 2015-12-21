'use strict';

angular.module('clickApp.services').factory('gameTerrains', ['point', 'terrain', function gameTerrainsServiceFactory(pointService, terrainService) {
  var gameTerrainsService = {
    create: function create() {
      return {
        active: [],
        locked: []
      };
    },
    all: function terrainsAll(terrains) {
      return R.concat(terrains.active, terrains.locked);
    },
    findStamp: function terrainsFindStamp(stamp, terrains) {
      return new self.Promise(function (resolve, reject) {
        var terrain = R.pipe(gameTerrainsService.all, R.find(R.pathEq(['state', 'stamp'], stamp)))(terrains);
        if (R.isNil(terrain)) reject('Terrain ' + stamp + ' not found');else resolve(terrain);
      });
    },
    findAnyStamps: function terrainsFindAnyStamps(stamps, terrains) {
      return R.pipePromise(R.map(function (stamp) {
        return gameTerrainsService.findStamp(stamp, terrains).catch(R.always(null));
      }), R.promiseAll, function (terrains) {
        if (R.isEmpty(R.reject(R.isNil, terrains))) {
          return self.Promise.reject('No terrain found');
        }
        return terrains;
      })(stamps);
    },
    onStamps: function terrainsOnStamps(method) /*, stamps, terrains*/{
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      if ('Function' !== R.type(terrainService[method])) {
        return self.Promise.reject('Unknown method ' + method + ' on terrains');
      }

      var terrains = R.last(args);
      var stamps = R.nth(-2, args);

      args = R.slice(0, -2, args);
      var reason;
      return R.pipeP(gameTerrainsService.findAnyStamps$(stamps), R.reject(R.isNil), R.map(function (terrain) {
        return self.Promise.resolve(terrainService[method].apply(null, R.append(terrain, args))).catch(function (_reason) {
          console.error(_reason);
          reason = _reason;
          return '##failed##';
        });
      }), R.promiseAll, function (results) {
        if (R.isEmpty(R.reject(R.equals('##failed##'), results))) {
          console.error('Terrains: onStamps all failed', args);
          return self.Promise.reject(reason);
        }
        return R.map(function (res) {
          return res === '##failed##' ? null : res;
        }, results);
      })(terrains);
    },
    lockStamps: function terrainsLockStamps(lock, stamps, terrains) {
      return R.pipeP(function () {
        return gameTerrainsService.findAnyStamps(stamps, terrains);
      }, R.reject(R.isNil), R.forEach(terrainService.setLock$(lock)), function () {
        return updateActiveLocked(terrains);
      })();
    },
    add: function terrainsAdd(news, terrains) {
      return R.pipe(gameTerrainsService.removeStamps$(R.map(R.path(['state', 'stamp']), news)), function (terrains) {
        return R.assoc('active', R.concat(terrains.active, news), terrains);
      }, function (terrains) {
        return updateActiveLocked(terrains);
      })(terrains);
    },
    removeStamps: function terrainsRemoveStamps(stamps, terrains) {
      function inStamps(terrain) {
        return R.find(R.equals(R.path(['state', 'stamp'], terrain)), stamps);
      }
      return R.pipe(R.assoc('active', R.reject(inStamps, terrains.active)), R.assoc('locked', R.reject(inStamps, terrains.locked)))(terrains);
    },
    copyStamps: function terrainsCopyStamps(stamps, terrains) {
      return R.pipeP(gameTerrainsService.findAnyStamps$(stamps), R.reject(R.isNil), function (selection) {
        var base = R.pick(['x', 'y', 'r'], selection[0].state);

        return {
          base: base,
          terrains: R.map(R.compose(pointService.differenceFrom$(base), terrainService.saveState), selection)
        };
      })(terrains);
    }
  };
  function updateActiveLocked(terrains) {
    var partition = R.pipe(gameTerrainsService.all, R.partition(terrainService.isLocked))(terrains);
    return {
      active: partition[1],
      locked: partition[0]
    };
  }
  R.curryService(gameTerrainsService);
  return gameTerrainsService;
}]);
//# sourceMappingURL=terrains.js.map
