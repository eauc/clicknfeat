(function() {
  const jasmine_it = self.it;
  self.it = function it(desc, test) {
    // console.log('it', desc);
    return jasmine_it(desc, it.wrapper(test));
  };

  self.it.wrapper = function wrapper(test) {
    return function wrappedTest(done) {
      // console.info('wrapper', 'base');
      const testP = new self.Promise((resolve, reject) => {
        try {
          resolve(test.apply(this, [done]));
        }
        catch(e) {
          reject(e);
        }
      }).catch((error) => {
        expect('This test').toBe('not rejected');
        expect(error).toBe(null);
      });
      return R.threadP(testP)(
        () => {
          if(R.length(test) === 0) {
            // console.log('wrapper', 'base', 'auto done');
            done();
          }
        }
      );
    };
  };
  self.it.wrapper._debug = 'thenExpect';
})();
