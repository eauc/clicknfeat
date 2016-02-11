'use strict';

(function () {
  self.filterCallsByArgs = function filterCallsByArgs(spy, predicate) {
    return R.filter(R.compose(predicate, R.prop('args')), spy.calls.all());
  };

  self.findCallByArgs = function findCallByArgs(spy, predicate) {
    return R.pipe(R.filter(R.compose(predicate, R.prop('args'))), R.head)(spy.calls.all());
  };
})();
//# sourceMappingURL=filterCalls.js.map
