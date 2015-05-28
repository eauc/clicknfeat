'use strict';

self.settingsServiceFactory = function settingsServiceFactory(localStorage,
                                                              jsonStringifier) {
  var SETTINGS_STORAGE_KEY = 'clickApp.settings';
  var DEFAULT_SETTINGS = {};
  var UPDATERS = {};
  var settingsService = {
    register: function settingsRegister(type, name, settings, updater) {
      DEFAULT_SETTINGS[type] = DEFAULT_SETTINGS[type] || {};
      UPDATERS[type] = UPDATERS[type] || {};

      // Object.freeze(settings);
      
      DEFAULT_SETTINGS[type][name] = settings;
      UPDATERS[type][name] = updater;
    },
    load: function settingsLoad() {
      var data = localStorage.getItem(SETTINGS_STORAGE_KEY);
      var settings = {};
      if(R.exists(data)) {
        try {
          settings = JSON.parse(data);
        }
        catch(e) {
          console.log('failed to load settings', e);
        }
      }
      return settings;
    },
    init: function settingsInit() {
      return R.pipe(
        settingsService.bind,
        function(stored) {
          return {
            default: DEFAULT_SETTINGS,
            current: stored,
          };
        },
        settingsService.update
      )(settingsService.load());
    },
    bind: function settingsBind(settings) {
      return R.pipe(
        R.keys,
        R.reduce(function(mem, type) {
          var settings_type = R.propOr({}, type, settings);
          mem[type] = R.pipe(
            R.keys,
            R.reduce(function(mem, name) {
              var bs = Object.create(DEFAULT_SETTINGS[type][name]);
              R.extend(bs, R.propOr({}, name, settings_type));
              mem[name] = bs;
              return mem;
            }, {})
          )(DEFAULT_SETTINGS[type]);
          return mem;
        }, {})
      )(DEFAULT_SETTINGS);
    },
    update: function settingsUpdate(settings) {
      R.pipe(
        R.keys,
        R.forEach(function(type) {
          R.pipe(
            R.keys,
            R.filter(function(name) {
              return R.exists(UPDATERS[type][name]);
            }),
            R.forEach(function(name) {
              UPDATERS[type][name](settings.current[type][name]);
            })
          )(settings.current[type]);
        })
      )(settings.current);
      settingsService.store(settings);
      return settings;
    },
    store: function settingsStore(settings) {
      console.log('storing settings', settings.current);
      var json = JSON.stringify(settings.current);
      localStorage.setItem(SETTINGS_STORAGE_KEY, json);
    }
  };
  return settingsService;
};
