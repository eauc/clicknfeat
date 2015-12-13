'use strict';

angular.module('clickApp.services')
  .factory('localStorage', [
    'jsonParser',
    'jsonStringifier',
    function(jsonParserService,
             jsonStringifierService) {
      var localStorageService = {
        getItem: function localStorageGetItem(key) {
          return new self.Promise(function(resolve/*, reject*/) {
            resolve(self.localStorage.getItem(key));
          });
        },
        load: function localStorageLoad(key) {
          return localStorageService.getItem(key)
            .then(jsonParserService.parse);
        },
        setItem: function localStoragesetItem(key, value) {
          return new self.Promise(function(resolve/*, reject*/) {
            self.localStorage.setItem(key, value);
            resolve(value);
          });
        },
        save: function localStorageSave(key, value) {
          return jsonStringifierService.stringify(value)
            .then(localStorageService.setItem$(key))
            .then(R.always(value));
        },
        removeItem: function localStorageRemoveItem(key) {
          return new self.Promise(function(resolve/*, reject*/) {
            resolve(self.localStorage.removeItem(key));
          });
        }
      };
      R.curryService(localStorageService);
      return localStorageService;
    }
  ]);
