(function() {
  const jasmine_beforeEach = self.beforeEach;
  self.beforeEach = function beforeEach(fn) {
    jasmine_beforeEach(function(done) {
      R.threadP(done)(
        R.bind(fn, this)
      ).catch((error) => {
        expect('This setup').toBe('not rejected');
        expect(error).toBe(null);
      }).then(() => {
        if(R.length(fn) === 0) {
          done();
        }
      });
    });
  };
})();
