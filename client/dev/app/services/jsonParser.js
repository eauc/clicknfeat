'use strict';

(function () {
  angular.module('clickApp.services').factory('jsonParser', jsonParserServiceFactory);

  jsonParserServiceFactory.$inject = [];
  function jsonParserServiceFactory() {
    var jsonParserService = {
      parse: jsonParse
    };
    R.curryService(jsonParserService);
    return jsonParserService;

    function jsonParse(string) {
      return self.Promise.resolve(string).then(function (string) {
        return JSON.parse(string);
      }).catch(function (error) {
        console.error('JSON Parse error', error);
        return self.Promise.reject(error.message);
      });
    }
  }
})();
//# sourceMappingURL=jsonParser.js.map
