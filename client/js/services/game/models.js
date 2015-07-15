'use strict';

self.gameModelsServiceFactory = function gameModelsServiceFactory(modelService) {
  var gameModelsService = {
    create: function() {
      return {
        active: [],
        locked: [],
      };
    },
    all: function modelsAll(models) {
      return R.concat(models.active, models.locked);
    },
    findStamp: function modelsFindStamp(stamp, models) {
      return (R.find(R.pathEq(['state','stamp'], stamp), models.active) ||
              R.find(R.pathEq(['state','stamp'], stamp), models.locked));
    },
    findStampsBetweenPoints: function modelsFindStampBetweenPoints(top_left, bottom_right, models) {
      models = R.concat(models.active, models.locked);
      return R.pipe(
        R.filter(modelService.isBetweenPoints$(top_left, bottom_right)),
        R.map(R.path(['state','stamp']))
      )(models);
    },
    onStamps: function modelsOnStamps(method /*, ...args..., stamps, models*/) {
      if('Function' !== R.type(modelService[method])) return [];

      var args = Array.prototype.slice.call(arguments);
      var models = R.last(args);
      var stamps = R.nth(-2, args);

      args = R.slice(1, -2, args);
      return R.pipe(
        R.map(function(stamp) {
          return gameModelsService.findStamp(stamp, models);
        }),
        R.map(function(model) {
          return modelService[method].apply(null, R.append(model, args));
        })
      )(stamps);
    },
    lockStamps: function modelsLockStamps(lock, stamps, models) {
      R.pipe(
        R.map(function(stamp) {
          return gameModelsService.findStamp(stamp, models);
        }),
        R.forEach(modelService.setLock$(lock))
      )(stamps);
      var partition = R.pipe(
        gameModelsService.all,
        R.partition(modelService.isLocked)
      )(models);
      return {
        active: partition[1],
        locked: partition[0]
      };
    },
    add: function modelsAdd(mods, models) {
      return R.pipe(
        gameModelsService.removeStamps$(R.map(R.path(['state','stamp']), mods)),
        function(models) {
          return R.assoc('active', R.concat(models.active, mods), models);
        }
      )(models);
    },
    removeStamps: function modelsRemoveStamps(stamps, models) {
      function inStamps(model) {
        return R.find(R.eq(R.path(['state', 'stamp'], model)), stamps);
      }
      return R.pipe(
        R.assoc('active', R.reject(inStamps, models.active)),
        R.assoc('locked', R.reject(inStamps, models.locked))
      )(models);
    },
  };
  R.curryService(gameModelsService);
  return gameModelsService;
};
