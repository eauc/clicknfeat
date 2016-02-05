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

        // console.log('wrapper', _desc);
        var context = self.Promise.resolve(R.bind(setup, this)()).catch(function (error) {
          console.warn('Setup error', _desc, error);
          _this.catchError = R.thread(_this.catchError)(R.defaultTo([]), R.append(error));
        });
        return R.threadP(context)(function (context) {
          // console.log('context', _desc, context);
          _this.context = context;
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
