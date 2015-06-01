'use strict';

self.jsonParserServiceFactory = function jsonParserServiceFactory() {
  var jsonParserService = {
    parse: function jsonParse(string) {
      return self.Promise.resolve(string)
        .then(function(string) {
          return JSON.parse(string);
        })
        .catch(function(error) {
          console.log('JSON Parse error', error);
          throw error;
        });
    },
  };
  return jsonParserService;
};
