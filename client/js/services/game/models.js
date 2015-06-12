'use strict';

self.gameModelsServiceFactory = function gameModelsServiceFactory(modelService) {
  var gameModelsService = {
    create: function() {
      return {
        active: [],
        locked: [],
      };
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
    add: function modelsAdd(mods, models) {
      console.log(arguments);
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
    // isActive: function modelsIsLocked(stamp, models) {
    //   return R.find(R.pathEq(['state','stamp'], stamp), models.active);
    // },
    // isLocked: function modelsIsLocked(stamp, models) {
    //   return R.find(R.pathEq(['state','stamp'], stamp), models.locked);
    // },
    // lockStamps: function modelsLockStamps(stamps, models) {
    //   var temps = R.map(function(stamp) {
    //     return gameModelsService.findStamp(stamp, models);
    //   }, stamps);
    //   return R.pipe(
    //     R.assoc('active', R.reject(function(model) {
    //       return R.find(R.eq(model.state.stamp), stamps);
    //     }, models.active)),
    //     R.assoc('locked', R.reject(function(model) {
    //       return R.find(R.eq(model.state.stamp), stamps);
    //     }, models.locked)),
    //     function (models) {
    //       return R.assoc('locked', R.concat(models.locked, temps), models);
    //     }
    //   )(models);
    // },
    // unlockStamps: function modelsUnlockStamps(stamps, models) {
    //   var temps = R.map(function(stamp) {
    //     return gameModelsService.findStamp(stamp, models);
    //   }, stamps);
    //   return R.pipe(
    //     R.assoc('active', R.reject(function(model) {
    //       return R.find(R.eq(model.state.stamp), stamps);
    //     }, models.active)),
    //     R.assoc('locked', R.reject(function(model) {
    //       return R.find(R.eq(model.state.stamp), stamps);
    //     }, models.locked)),
    //     function (models) {
    //       return R.assoc('active', R.concat(models.active, temps), models);
    //     }
    //   )(models);
    // },
    // modeForStamp: function modelSelectionModeForStamp(stamp, models) {
    //   var mode = (gameModelsService.isLocked(stamp, models) ?
    //               'ModelLocked' : 'Model');
    //   var type = R.defaultTo('aoe',
    //                          R.path(['state','type'],
    //                                 gameModelsService.findStamp(stamp, models)
    //                                )
    //                         );
    //   return type+mode;
    // },
  };
  R.curryService(gameModelsService);
  return gameModelsService;
};
