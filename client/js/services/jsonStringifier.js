'use strict';

self.jsonStringifierServiceFactory = function jsonStringifierServiceFactory() {
  var jsonStringifierService = {
    stringify: function jsonStringify(data) {
      return JSON.stringify(data, jsonFilter);
    },
  };
  function jsonFilter(key, value) {
    if(s.startsWith(key, '$$')) {
      return undefined;
    }
    return value;
  }
  return jsonStringifierService;
};
