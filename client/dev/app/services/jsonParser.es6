(function() {
  angular.module('clickApp.services')
    .factory('jsonParser', jsonParserServiceFactory);

  jsonParserServiceFactory.$inject = [];
  function jsonParserServiceFactory() {
    const jsonParserService = {
      parse: jsonParse
    };
    R.curryService(jsonParserService);
    return jsonParserService;

    function jsonParse(string) {
      return self.Promise.resolve(string)
        .then((string) => {
          return JSON.parse(string);
        })
        .catch((error) => {
          console.error('JSON Parse error', error);
          return self.Promise.reject(error.message);
        });
    }
  }
})();
