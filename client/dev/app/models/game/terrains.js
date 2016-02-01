'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
    fromStamps: function terrainsFromStamps(method, args, stamps, terrains) {
      return fromStamps$(R.compose(R.always, R.always(null)), method, args, stamps, terrains);
    },
    onStamps: function terrainsOnStamps(method, args, stamps, terrains) {
      return R.pipeP(fromStamps$(R.always, method, args, stamps), updateTerrains$(terrains))(terrains);
    },
    setStateStamps: function terrainsSetStateStamps(states, stamps, terrains) {
      return R.pipeP(gameTerrainsService.findAnyStamps$(stamps), R.addIndex(R.map)(function (terrain, index) {
        return R.isNil(terrain) ? null : terrainService.setState(states[index], terrain);
      }), R.reject(R.isNil), updateTerrains$(terrains))(terrains);
    },
    lockStamps: function terrainsLockStamps(lock, stamps, terrains) {
      return R.pipeP(gameTerrainsService.findAnyStamps$(stamps), R.reject(R.isNil), R.map(terrainService.setLock$(lock)), updateTerrains$(terrains))(terrains);
    },
    add: function terrainsAdd(news, terrains) {
      return R.pipe(gameTerrainsService.removeStamps$(R.map(R.path(['state', 'stamp']), news)), R.flip(updateTerrains$)(news))(terrains);
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
  var fromStamps$ = R.curry(function (onError, method, args, stamps, terrains) {
    if ('Function' !== R.type(terrainService[method])) {
      return self.Promise.reject('Unknown method ' + method + ' on terrains');
    }

    return R.pipeP(gameTerrainsService.findAnyStamps$(stamps), R.reject(R.isNil), R.map(function (terrain) {
      return self.Promise.resolve(terrainService[method].apply(null, [].concat(_toConsumableArray(args), [terrain]))).catch(onError(terrain));
    }), R.promiseAll)(terrains);
  });
  var updateTerrains$ = R.curry(function (terrains, news) {
    return R.pipe(gameTerrainsService.all, R.concat(news), R.uniqBy(R.path(['state', 'stamp'])), R.partition(terrainService.isLocked), function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var locked = _ref2[0];
      var active = _ref2[1];

      return {
        active: active,
        locked: locked
      };
    })(terrains);
  });
  R.curryService(gameTerrainsService);
  return gameTerrainsService;
}]);
//# sourceMappingURL=terrains.js.map
