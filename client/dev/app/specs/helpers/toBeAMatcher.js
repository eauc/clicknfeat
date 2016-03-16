'use strict';

(function () {
  var toBeAMatcher = {
    toBeA: matcherFactory('a'),
    toBeAn: matcherFactory('an')
  };

  beforeEach(function () {
    jasmine.addMatchers(toBeAMatcher);
  });

  function matcherFactory(a) {
    return function () {
      return { compare: compare };
    };

    function compare(actual, expected) {
      var result = {};
      result.pass = R.type(actual) === expected;
      if (result.pass) {
        result.message = 'Expected ' + actual + ' not to be ' + a + ' ' + expected;
      } else {
        result.message = 'Expected ' + actual + ' to be ' + a + ' ' + expected;
      }
      return result;
    }
  }
})();
//# sourceMappingURL=toBeAMatcher.js.map
