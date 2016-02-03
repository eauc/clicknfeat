"use strict";

R.promiseAll = R.bind(self.Promise.all, self.Promise);

R.pipePromise = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return R.pipeP.apply(R, R.prepend(R.bind(self.Promise.resolve, self.Promise), args));
};

R.rejectIf = R.curry(function (test, reason, obj) {
  if (test(obj)) return self.Promise.reject(reason);else return obj;
});
//# sourceMappingURL=promise.js.map
