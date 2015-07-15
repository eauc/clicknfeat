'use strict';

self.gameTemplatesServiceFactory = function gameTemplatesServiceFactory(templateService) {
  var gameTemplatesService = {
    create: function() {
      return {
        active: [],
        locked: []
      };
    },
    all: function templatesAll(templates) {
      return R.concat(templates.active, templates.locked);
    },
    findStamp: function templatesFindStamp(stamp, templates) {
      return (R.find(R.pathEq(['state','stamp'], stamp), templates.active) ||
              R.find(R.pathEq(['state','stamp'], stamp), templates.locked));
    },
    onStamps: function templatesOnStamps(method /*, ...args..., stamps, templates*/) {
      var args = Array.prototype.slice.call(arguments);
      var templates = R.last(args);
      var stamps = R.nth(-2, args);

      args = R.slice(0, -2, args);
      return R.pipe(
        R.map(function(stamp) {
          return gameTemplatesService.findStamp(stamp, templates);
        }),
        R.map(function(template) {
          return templateService.call.apply(null, R.append(template, args));
        })
      )(stamps);
    },
    add: function templatesAdd(temps, templates) {
      return R.pipe(
        gameTemplatesService.removeStamps$(R.map(R.path(['state','stamp']), temps)),
        function(templates) {
          return R.assoc('active', R.concat(templates.active, temps), templates);
        }
      )(templates);
    },
    removeStamps: function templatesRemoveStamps(stamps, templates) {
      function inStamps(template) {
        return R.find(R.eq(R.path(['state', 'stamp'], template)), stamps);
      }
      return R.pipe(
        R.assoc('active', R.reject(inStamps, templates.active)),
        R.assoc('locked', R.reject(inStamps, templates.locked))
      )(templates);
    },
    isActive: function templatesIsLocked(stamp, templates) {
      return R.find(R.pathEq(['state','stamp'], stamp), templates.active);
    },
    isLocked: function templatesIsLocked(stamp, templates) {
      return R.find(R.pathEq(['state','stamp'], stamp), templates.locked);
    },
    lockStamps: function templatesLockStamps(lock, stamps, templates) {
      R.pipe(
        R.map(function(stamp) {
          return gameTemplatesService.findStamp(stamp, templates);
        }),
        R.forEach(templateService.setLock$(lock))
      )(stamps);
      var partition = R.pipe(
        gameTemplatesService.all,
        R.partition(templateService.isLocked)
      )(templates);
      return {
        active: partition[1],
        locked: partition[0]
      };
    },
    modeForStamp: function templateSelectionModeForStamp(stamp, templates) {
      var type = R.defaultTo('aoe',
                             R.path(['state','type'],
                                    gameTemplatesService.findStamp(stamp, templates)
                                   )
                            );
      return type+'Template';
    },
  };
  R.curryService(gameTemplatesService);
  return gameTemplatesService;
};
