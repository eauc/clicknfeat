"use strict";

(function () {
  R.thread = function thread(value) {
    return function () {
      for (var _len = arguments.length, fn = Array(_len), _key = 0; _key < _len; _key++) {
        fn[_key] = arguments[_key];
      }

      return R.pipe.apply(R, fn)(value);
    };
  };
  R.threadP = function threadP(value) {
    return function () {
      for (var _len2 = arguments.length, fn = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        fn[_key2] = arguments[_key2];
      }

      return R.pipeP.apply(R, [R.always(self.Promise.resolve(value))].concat(fn))();
    };
  };
})();
//# sourceMappingURL=thread.js.map