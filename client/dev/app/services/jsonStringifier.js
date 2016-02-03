'use strict';

(function () {
  angular.module('clickApp.services').factory('jsonStringifier', jsonStringifierServiceFactory);

  jsonStringifierServiceFactory.$inject = [];
  function jsonStringifierServiceFactory() {
    var jsonStringifierService = {
      stringify: jsonStringify
    };
    R.curryService(jsonStringifierService);
    return jsonStringifierService;

    function jsonStringify(data) {
      return JSON.stringify(data, jsonFilter);
    }
    function jsonFilter(key, value) {
      if (s.startsWith(key, '$$')) {
        return undefined;
      }
      return value;
    }
  }
})();
//# sourceMappingURL=jsonStringifier.js.map