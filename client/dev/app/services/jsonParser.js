'use strict';

(function () {
  angular.module('clickApp.services').factory('jsonParser', jsonParserServiceFactory);

  jsonParserServiceFactory.$inject = [];
  function jsonParserServiceFactory() {
    var jsonParserService = {
      parseP: jsonParseP
    };
    R.curryService(jsonParserService);
    return jsonParserService;

    function jsonParseP(string) {
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
