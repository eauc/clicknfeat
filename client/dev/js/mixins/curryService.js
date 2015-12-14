'use strict';

R.curryService = (function () {
  return function (obj) {
    R.pipe(R.functions, R.reject(R.compose(R.not, R.isEmpty, R.match(/\$$/))), R.forEach(function (k) {
      obj[k + '$'] = R.curry(obj[k]);
    }))(obj);
  };
})();
//# sourceMappingURL=curryService.js.map
