'use strict';

self.gameTemplatesServiceFactory = function gameTemplatesServiceFactory() {
  var gameTemplatesService = {
    create: function() {
      return {
        active: [],
        locked: []
      };
    },
    findStamp: function templatesFindStamp(stamp, templates) {
      return (R.find(R.pathEq(['state','stamp'], stamp), templates.active) ||
              R.find(R.pathEq(['state','stamp'], stamp), templates.locked));
    },
    add: function templatesAdd(template, templates) {
      return R.assoc('active', R.pipe(
        R.reject(R.pathEq(['state','stamp'], template.state.stamp)),
        R.append(template)
      )(templates.active), templates);
    },
    removeStamp: function templatesRemove(stamp, templates) {
      return R.pipe(
        R.assoc('active', R.reject(R.pathEq(['state','stamp'], stamp), templates.active)),
        R.assoc('locked', R.reject(R.pathEq(['state','stamp'], stamp), templates.locked))
      )(templates);
    },
    isActive: function templatesIsLocked(stamp, templates) {
      return R.find(R.pathEq(['state','stamp'], stamp), templates.active);
    },
    isLocked: function templatesIsLocked(stamp, templates) {
      return R.find(R.pathEq(['state','stamp'], stamp), templates.locked);
    },
    lockStamps: function templatesLockStamps(stamps, templates) {
      var temps = R.map(function(stamp) {
        return gameTemplatesService.findStamp(stamp, templates);
      }, stamps);
      return R.pipe(
        R.assoc('active', R.reject(function(template) {
          return R.find(R.eq(template.state.stamp), stamps);
        }, templates.active)),
        R.assoc('locked', R.reject(function(template) {
          return R.find(R.eq(template.state.stamp), stamps);
        }, templates.locked)),
        function (templates) {
          return R.assoc('locked', R.concat(templates.locked, temps), templates);
        }
      )(templates);
    },
    unlockStamps: function templatesUnlockStamps(stamps, templates) {
      var temps = R.map(function(stamp) {
        return gameTemplatesService.findStamp(stamp, templates);
      }, stamps);
      return R.pipe(
        R.assoc('active', R.reject(function(template) {
          return R.find(R.eq(template.state.stamp), stamps);
        }, templates.active)),
        R.assoc('locked', R.reject(function(template) {
          return R.find(R.eq(template.state.stamp), stamps);
        }, templates.locked)),
        function (templates) {
          return R.assoc('active', R.concat(templates.active, temps), templates);
        }
      )(templates);
    },
  };
  R.curryService(gameTemplatesService);
  return gameTemplatesService;
};
