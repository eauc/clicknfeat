'use strict';

self.settingsServiceFactory = function settingsServiceFactory(localStorageService,
                                                              jsonParserService,
                                                              jsonStringifierService) {
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
      var data = localStorageService.getItem(SETTINGS_STORAGE_KEY);
      return jsonParserService.parse(data)
        .catch(function(error) {
          console.log('failed to load settings');
          return {};
        });
    },
    init: function settingsInit() {
      return R.pipeP(
        settingsService.load,
        settingsService.bind,
        settingsService.update
      )(null);
    },
    bind: function settingsBind(settings) {
      settings = R.defaultTo({}, settings);
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
        }, {}),
        function(binded) {
          return {
            default: DEFAULT_SETTINGS,
            current: binded,
          };
        }
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
      var json = jsonStringifierService.stringify(settings.current);
      localStorageService.setItem(SETTINGS_STORAGE_KEY, json);
    }
  };
  return settingsService;
};
