'use strict';

self.settingsServiceFactory = function settingsServiceFactory(localStorage,
                                                              jsonStringifier) {
  var SETTINGS_STORAGE_KEY = 'clickApp.settings';
  var DEFAULT_SETTINGS = {
    'Bindings': {}
  };
  var UPDATERS = {
    'Bindings': {}
  };
  var settingsService = {
    registerBindings: function settingsRegisterBindings(name, bindings, updater) {
      DEFAULT_SETTINGS['Bindings'][name] = R.clone(bindings);
      UPDATERS['Bindings'][name] = updater;
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
      var stored = settingsService.load();
      settingsService.bind(stored);
      var settings = {
        default: DEFAULT_SETTINGS,
        current: stored,
      };
      settingsService.update(settings);
      return settings;
    },
    bind: function settingsBind(settings) {
      settings['Bindings'] = R.propOr({}, 'Bindings', settings);
      R.pipe(
        R.keys,
        R.forEach(function(name) {
          var bs = Object.create(DEFAULT_SETTINGS['Bindings'][name]);
          R.extend(bs, R.propOr({}, name, settings['Bindings']));
          settings['Bindings'][name] = bs;
        })
      )(DEFAULT_SETTINGS['Bindings']);
    },
    update: function settingsUpdate(settings) {
      R.pipe(
        R.keys,
        R.filter(function(name) {
          return R.exists(UPDATERS['Bindings'][name]);
        }),
        R.forEach(function(name) {
          UPDATERS['Bindings'][name](settings.current['Bindings'][name]);
        })
      )(settings.current['Bindings']);
      settingsService.store(settings);
    },
    store: function settingsStore(settings) {
      console.log('storing settings', settings.current);
      var json = JSON.stringify(settings.current);
      localStorage.setItem(SETTINGS_STORAGE_KEY, json);
    }
  };
  return settingsService;
};
