'use strict';

(function () {
  angular.module('clickApp.services').factory('settings', settingsModelFactory);

  settingsModelFactory.$inject = ['localStorage'];
  function settingsModelFactory(localStorageService) {
    var SETTINGS_STORAGE_KEY = 'clickApp.settings';
    var DEFAULT_SETTINGS = {};
    var UPDATERS = {};
    var settingsModel = {
      register: settingsRegister,
      loadP: settingsLoadP,
      initP: settingsInitP,
      bind: settingsBind,
      update: settingsUpdate,
      store: settingsStore
    };

    R.curryService(settingsModel);
    return settingsModel;

    function settingsRegister(type, name, settings, updater) {
      DEFAULT_SETTINGS[type] = R.defaultTo({}, DEFAULT_SETTINGS[type]);
      UPDATERS[type] = R.defaultTo({}, UPDATERS[type]);
      console.log('Settings: register', type, name, settings);
      // Object.freeze(settings);

      DEFAULT_SETTINGS[type][name] = settings;
      UPDATERS[type][name] = updater;
    }
    function settingsLoadP() {
      return R.threadP(SETTINGS_STORAGE_KEY)(function (key) {
        return localStorageService.loadP(key).catch(R.spy('settings: failed to load data'));
      }, R.defaultTo({}), R.spyWarn('Settings load'));
    }
    function settingsInitP() {
      return R.threadP()(settingsModel.loadP, settingsModel.bind, settingsModel.update);
    }
    function settingsBind(settings) {
      settings = R.defaultTo({}, settings);
      return R.thread(DEFAULT_SETTINGS)(R.keys, R.reduce(bindType, {}), function (binded) {
        return {
          default: DEFAULT_SETTINGS,
          current: binded
        };
      });

      function bindType(mem, type) {
        var settings_type = R.propOr({}, type, settings);
        mem[type] = R.thread(DEFAULT_SETTINGS[type])(R.keys, R.reduce(bindName, {}));
        return mem;

        function bindName(mem, name) {
          var base = Object.create(DEFAULT_SETTINGS[type][name]);
          R.extend(base, R.propOr({}, name, settings_type));
          mem[name] = base;
          return mem;
        }
      }
    }
    function settingsUpdate(settings) {
      R.thread(settings.current)(R.keys, R.forEach(updateType));
      return settings;

      function updateType(type) {
        R.thread(settings.current[type])(R.keys, R.filter(function (name) {
          return R.exists(UPDATERS[type][name]);
        }), R.forEach(function (name) {
          UPDATERS[type][name](settings.current[type][name]);
        }));
      }
    }
    function settingsStore(settings) {
      return R.thread(settings)(R.prop('current'), R.spyWarn('Settings store'), localStorageService.save$(SETTINGS_STORAGE_KEY));
    }
  }
})();
//# sourceMappingURL=settings.js.map
