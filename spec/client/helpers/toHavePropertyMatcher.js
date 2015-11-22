'use strict';

var toHavePropertyMatcher = (function() {
  return {
    toHaveProperty: function(util, customEqualityTesters) {
      return {
        compare: function(actual, expected) {
          var result = {};
          result.pass = R.has(expected, actual);
          if(result.pass) {
            result.message = "Expected " + JSON.stringify(actual) +
              " not to have property [" + expected + "]";
          }
          else {
            result.message = "Expected " + JSON.stringify(actual) +
              " to have property [" + expected + "]";
          }
          return result;
        }
      };
    }
  };
})();

beforeEach(function() {
  jasmine.addMatchers(toHavePropertyMatcher);
});
