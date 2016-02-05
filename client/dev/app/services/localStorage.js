'use strict';

(function () {
  angular.module('clickApp.services').factory('localStorage', localStorageServiceFactory);

  localStorageServiceFactory.$inject = ['jsonParser', 'jsonStringifier'];
  function localStorageServiceFactory(jsonParserService, jsonStringifierService) {
    var localStorageService = {
      keys: localStorageKeys,
      getItem: localStorageGetItem,
      loadP: localStorageLoadP,
      setItem: localStorageSetItem,
      save: localStorageSave,
      removeItem: localStorageRemoveItem
    };
    R.curryService(localStorageService);
    return localStorageService;

    function localStorageKeys() {
      return R.thread(self.localStorage.length)(R.range(0), R.map(R.bind(self.localStorage.key, self.localStorage)));
    }
    function localStorageGetItem(key) {
      return self.localStorage.getItem(key);
    }
    function localStorageLoadP(key) {
      return R.threadP(key)(localStorageService.getItem, jsonParserService.parseP);
    }
    function localStorageSetItem(key, value) {
      self.localStorage.setItem(key, value);
      return value;
    }
    function localStorageSave(key, value) {
      R.thread(value)(jsonStringifierService.stringify, localStorageService.setItem$(key));
      return value;
    }
    function localStorageRemoveItem(key) {
      return self.localStorage.removeItem(key);
    }
  }
})();
//# sourceMappingURL=localStorage.js.map
