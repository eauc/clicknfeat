"use strict";

(function () {
  R.viewOr = R.curry(function (defaut, lens, obj) {
    return R.defaultTo(defaut, R.view(lens, obj));
  });
})();
//# sourceMappingURL=viewOr.js.map
