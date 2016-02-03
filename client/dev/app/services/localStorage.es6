(function() {
  angular.module('clickApp.services')
    .factory('localStorage', localStorageServiceFactory);

  localStorageServiceFactory.$inject = [
    'jsonParser',
    'jsonStringifier',
  ];
  function localStorageServiceFactory(jsonParserService,
                                      jsonStringifierService) {
    const localStorageService = {
      keys: localStorageKeys,
      getItemP: localStorageGetItemP,
      loadP: localStorageLoadP,
      setItemP: localStorageSetItemP,
      saveP: localStorageSaveP,
      removeItemP: localStorageRemoveItemP
    };
    R.curryService(localStorageService);
    return localStorageService;

    function localStorageKeys() {
      return R.pipe(
        R.always(self.localStorage.length),
        R.range(0),
        R.map(R.bind(self.localStorage.key,
                     self.localStorage))
      )();
    }
    function localStorageGetItemP(key) {
      return new self.Promise((resolve) => {
        resolve(self.localStorage.getItem(key));
      });
    }
    function localStorageLoadP(key) {
      return localStorageService.getItem(key)
        .then(jsonParserService.parse);
    }
    function localStorageSetItemP(key, value) {
      return new self.Promise((resolve) => {
        self.localStorage.setItem(key, value);
        resolve(value);
      });
    }
    function localStorageSaveP(key, value) {
      return jsonStringifierService.stringify(value)
        .then(localStorageService.setItem$(key))
        .then(R.always(value));
    }
    function localStorageRemoveItemP(key) {
      return new self.Promise((resolve) => {
        resolve(self.localStorage.removeItem(key));
      });
    }
  }
})();
