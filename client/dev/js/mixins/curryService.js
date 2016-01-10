'use strict';

R.curryService = function () {
  return function (obj) {
    R.pipe(R.keys, R.filter(R.compose(R.equals('Function'), R.type, R.flip(R.prop)(obj))), R.reject(R.compose(R.not, R.isEmpty, R.match(/\$$/))), R.forEach(function (k) {
      obj[k + '$'] = R.curry(obj[k]);
    }))(obj);
  };
}();
//# sourceMappingURL=curryService.js.map
