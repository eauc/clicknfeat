(function() {
  angular.module('clickApp.services')
    .factory('jsonParser', jsonParserServiceFactory);

  jsonParserServiceFactory.$inject = [];
  function jsonParserServiceFactory() {
    const jsonParserService = {
      parseP: jsonParseP
    };
    R.curryService(jsonParserService);
    return jsonParserService;

    function jsonParseP(string) {
      return self.Promise.resolve(string)
        .then((string) => JSON.parse(string))
        .catch((error) => {
          console.error('JSON Parse error', error);
          return R.rejectP(error.message);
        });
    }
  }
})();
