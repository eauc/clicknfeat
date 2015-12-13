'use strict';

var toBeAMatcher = (function() {
  var factory = function(a) {
    return function() {
      return {
        compare: function(actual, expected) {
          var result = {};
          result.pass = (R.type(actual) === expected);
          if(result.pass) {
            result.message = 'Expected ' + actual + ' not to be '+a+' ' + expected;
          }
          else {
            result.message = 'Expected ' + actual + ' to be '+a+' ' + expected;
          }
          return result;
        }
      };
    };
  };
  return {
    toBeA: factory('a'),
    toBeAn: factory('an')
  };
})();

beforeEach(function() {
  jasmine.addMatchers(toBeAMatcher);
});
