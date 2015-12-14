"use strict";

R.spy = (function () {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return function (obj) {
      console.log.apply(console, R.append(obj, args));
      return obj;
    };
  };
})();

R.spyError = (function () {
  return function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return function (obj) {
      console.error.apply(console, R.append(obj, args));
      return obj;
    };
  };
})();
//# sourceMappingURL=spy.js.map
