'use strict';

(function () {
  var jasmine_it = self.it;
  self.it = function it(desc, test) {
    // console.log('it', desc);
    return jasmine_it(desc, it.wrapper(test));
  };

  self.it.wrapper = function wrapper(test) {
    return function wrappedTest(done) {
      var _this = this;

      // console.info('wrapper', 'base');
      var testP = new self.Promise(function (resolve, reject) {
        try {
          resolve(test.apply(_this, [done]));
        } catch (e) {
          reject(e);
        }
      }).catch(function (error) {
        expect('This test').toBe('not rejected');
        expect(error).toBe(null);
      });
      return R.threadP(testP)(function () {
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
