'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

angular.module('clickApp.services').factory('gameModels', ['point', 'model', function gameModelsServiceFactory(pointService, modelService) {
  var gameModelsService = {
    create: function create() {
      return {
        active: [],
        locked: []
      };
    },
    all: function modelsAll(models) {
      return R.concat(models.active, models.locked);
    },
    findStamp: function modelsFindStamp(stamp, models) {
      return new self.Promise(function (resolve, reject) {
        var model = R.pipe(gameModelsService.all, R.find(R.pathEq(['state', 'stamp'], stamp)))(models);
        if (R.isNil(model)) reject('Model ' + stamp + ' not found');else resolve(model);
      });
    },
    findAnyStamps: function modelsFindAnyStamps(stamps, models) {
      return R.pipePromise(R.map(function (stamp) {
        return gameModelsService.findStamp(stamp, models).catch(R.always(null));
      }), R.promiseAll, function (models) {
        if (R.isEmpty(R.reject(R.isNil, models))) {
          return self.Promise.reject('No model found');
        }
        return models;
      })(stamps);
    },
    findStampsBetweenPoints: function modelsFindStampBetweenPoints(top_left, bottom_right, models) {
      return new self.Promise(function (resolve, reject) {
        models = gameModelsService.all(models);
        var stamps = R.pipe(R.filter(modelService.isBetweenPoints$(top_left, bottom_right)), R.map(R.path(['state', 'stamp'])))(models);
        if (R.isEmpty(stamps)) reject('No model found between points');else resolve(stamps);
      });
    },
    fromStamps: function modelsFromStamps(method, args, stamps, models) {
      return fromStamps$(R.compose(R.always, R.always(null)), method, args, stamps, models);
    },
    onStamps: function modelsOnStamps(method, args, stamps, models) {
      return R.pipeP(fromStamps$(R.always, method, args, stamps), updateModels$(models))(models);
    },
    setStateStamps: function modelsSetStateStamps(states, stamps, models) {
      return R.pipeP(gameModelsService.findAnyStamps$(stamps), R.addIndex(R.map)(function (model, index) {
        return R.isNil(model) ? null : modelService.setState(states[index], model);
      }), R.reject(R.isNil), updateModels$(models))(models);
    },
    lockStamps: function modelsLockStamps(lock, stamps, models) {
      return R.pipeP(gameModelsService.findAnyStamps$(stamps), R.reject(R.isNil), R.map(modelService.setLock$(lock)), updateModels$(models))(models);
    },
    add: function modelsAdd(mods, models) {
      return R.pipe(gameModelsService.removeStamps$(R.map(R.path(['state', 'stamp']), mods)), function (models) {
        return R.assoc('active', R.concat(models.active, mods), models);
      })(models);
    },
    removeStamps: function modelsRemoveStamps(stamps, models) {
      function inStamps(model) {
        return R.find(R.equals(R.path(['state', 'stamp'], model)), stamps);
      }
      return R.pipe(R.assoc('active', R.reject(inStamps, models.active)), R.assoc('locked', R.reject(inStamps, models.locked)))(models);
    },
    modeForStamp: function modelsModeForStamp(stamp, models) {
      return R.pipeP(function () {
        return gameModelsService.findStamp(stamp, models);
      }, modelService.modeFor$)();
    },
    copyStamps: function modelsCopyStamps(stamps, models) {
      return R.pipeP(gameModelsService.findAnyStamps$(stamps), R.reject(R.isNil), function (selection) {
        var base = R.pick(['x', 'y', 'r'], selection[0].state);

        return {
          base: base,
          models: R.map(R.compose(pointService.differenceFrom$(base), modelService.saveState), selection)
        };
      })(models);
    }
  };
  var fromStamps$ = R.curry(function (onError, method, args, stamps, models) {
    if ('Function' !== R.type(modelService[method])) {
      return self.Promise.reject('Unknown method ' + method + ' on models');
    }

    return R.pipeP(gameModelsService.findAnyStamps$(stamps), R.reject(R.isNil), R.map(function (model) {
      return self.Promise.resolve(modelService[method].apply(null, [].concat(_toConsumableArray(args), [model]))).catch(onError(model));
    }), R.promiseAll)(models);
  });
  var updateModels$ = R.curry(function (models, news) {
    return R.pipe(gameModelsService.all, R.concat(news), R.uniqBy(R.path(['state', 'stamp'])), R.partition(modelService.isLocked), function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var locked = _ref2[0];
      var active = _ref2[1];

      return {
        active: active,
        locked: locked
      };
    })(models);
  });
  R.curryService(gameModelsService);
  return gameModelsService;
}]);
//# sourceMappingURL=models.js.map
