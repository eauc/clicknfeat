'use strict';

angular.module('clickApp.services').factory('jsonStringifier', [function jsonStringifierServiceFactory() {
  var jsonStringifierService = {
    stringify: function jsonStringify(data) {
      return self.Promise.resolve(JSON.stringify(data, jsonFilter));
    }
  };
  function jsonFilter(key, value) {
    if (s.startsWith(key, '$$')) {
      return undefined;
    }
    return value;
  }
  R.curryService(jsonStringifierService);
  return jsonStringifierService;
}]);
//# sourceMappingURL=jsonStringifier.js.map
