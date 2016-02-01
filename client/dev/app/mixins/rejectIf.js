"use strict";

R.rejectIf = R.curry(function (test, reason, obj) {
  if (test(obj)) return self.Promise.reject(reason);else return obj;
});
//# sourceMappingURL=rejectIf.js.map
