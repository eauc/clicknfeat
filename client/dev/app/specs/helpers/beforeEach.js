'use strict';

(function () {
  var jasmine_beforeEach = self.beforeEach;
  self.beforeEach = function beforeEach(fn) {
    jasmine_beforeEach(function (done) {
      var _this = this;

      new self.Promise(function (resolve, reject) {
        try {
          resolve(R.bind(fn, _this)(done));
        } catch (e) {
          reject(e);
        }
      }).catch(function (error) {
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
