'use strict';

(function () {
  var jasmine_beforeEach = self.beforeEach;
  self.beforeEach = function beforeEach(fn) {
    jasmine_beforeEach(function (done) {
      R.threadP(done)(R.bind(fn, this)).catch(function (error) {
        expect('This setup').toBe('not rejected');
        expect(error).toBe(null);
      }).then(function () {
        if (R.length(fn) === 0) {
          done();
        }
      });
    });
  };
})();
//# sourceMappingURL=beforeEach.js.map
