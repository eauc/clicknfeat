'use strict';

(function () {
  self.context = function context(desc, setup, body) {
    // console.log('context', desc);
    var _wrapper = self.it.wrapper;
    self.it.wrapper = contextWrapper(_wrapper, desc, setup);
    self.describe(desc, body);
    self.it.wrapper = _wrapper;
  };

  self.xcontext = function xcontext(desc, setup, body) {
    self.xdescribe(desc, body);
  };

  function contextWrapper(_wrapper, _desc, setup) {
    var wrapper = function wrapper(test) {
      return function (done) {
        var _this = this;

        console.log('wrapper', _desc);
        this.contextExpectError = function () {
          this._context_expect_error = true;
        };
        var context = new self.Promise(function (resolve, reject) {
          try {
            resolve(R.bind(setup, _this)());
          } catch (e) {
            reject(e);
          }
        }).catch(function (error) {
          console.warn('Setup error', _desc, error);
          _this.contextError = R.thread(_this.contextError)(R.defaultTo([]), R.append(error));
        });
        return R.threadP(context)(function (context) {
          // console.log('context', _desc, context);
          _this.context = context;
        }, function () {
          if (!_this._context_expect_error && R.exists(_this.contextError)) {
            expect('This context').toBe('not rejected');
            expect(_this.contextError).toBe(undefined);
          }
        }, function () {
          return _wrapper(test).apply(_this, [done]);
        });
      };
    };
    wrapper._debug = _desc;
    return wrapper;
  }
})();
//# sourceMappingURL=context.js.map
