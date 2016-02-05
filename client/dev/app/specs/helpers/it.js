'use strict';

(function () {
  var jasmine_it = self.it;
  self.it = function it(desc, test) {
    // console.log('it', desc);
    return jasmine_it(desc, it.wrapper(test));
  };

  self.it.wrapper = function wrapper(test) {
    return function wrappedTest(done) {
      // console.log('wrapper', 'base');
      return R.threadP(test.apply(this, [done]))(function () {
        if (R.length(test) === 0) {
          // console.log('wrapper', 'base', 'auto done');
          done();
        }
      });
    };
  };
  self.it.wrapper._debug = 'thenExpect';
})();
//# sourceMappingURL=it.js.map
