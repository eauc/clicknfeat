'use strict';

angular.module('clickApp.services').factory('settings', ['localStorage', function settingsServiceFactory(localStorageService) {
  var SETTINGS_STORAGE_KEY = 'clickApp.settings';
  var DEFAULT_SETTINGS = {};
  var UPDATERS = {};
  var settingsService = {
    register: function settingsRegister(type, name, settings, updater) {
      DEFAULT_SETTINGS[type] = R.defaultTo({}, DEFAULT_SETTINGS[type]);
      UPDATERS[type] = R.defaultTo({}, UPDATERS[type]);
      console.log('Settings: register', type, name, settings);
      // Object.freeze(settings);

      DEFAULT_SETTINGS[type][name] = settings;
      UPDATERS[type][name] = updater;
    },
    load: function settingsLoad() {
      return R.pipeP(function () {
        return localStorageService.load(SETTINGS_STORAGE_KEY).catch(function () /* error */{
          console.log('settings: failed to load data');
        });
      }, R.defaultTo({}), R.spyWarn('Settings load'))();
    },
    init: function settingsInit() {
      return R.pipeP(settingsService.load, settingsService.bind, settingsService.update)(null);
    },
    bind: function settingsBind(settings) {
      settings = R.defaultTo({}, settings);
      return R.pipe(R.keys, R.reduce(function (mem, type) {
        var settings_type = R.propOr({}, type, settings);
        mem[type] = R.pipe(R.keys, R.reduce(function (mem, name) {
          var base = Object.create(DEFAULT_SETTINGS[type][name]);
          R.extend(base, R.propOr({}, name, settings_type));
          mem[name] = base;
          return mem;
        }, {}))(DEFAULT_SETTINGS[type]);
        return mem;
      }, {}), function (binded) {
        return {
          default: DEFAULT_SETTINGS,
          current: binded
        };
      })(DEFAULT_SETTINGS);
    },
    update: function settingsUpdate(settings) {
      R.pipe(R.keys, R.forEach(function (type) {
        R.pipe(R.keys, R.filter(function (name) {
          return R.exists(UPDATERS[type][name]);
        }), R.forEach(function (name) {
          UPDATERS[type][name](settings.current[type][name]);
        }))(settings.current[type]);
      }))(settings.current);
      return settings;
    },
    store: function settingsStore(settings) {
      return R.pipePromise(R.spyWarn('Settings store'), localStorageService.save$(SETTINGS_STORAGE_KEY))(settings.current);
    }
  };
  return settingsService;
}]);
//# sourceMappingURL=settings.js.map
