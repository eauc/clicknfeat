'use strict';

self.when = (function() {
  var _it = it;
  var setups = [];
  function whenIt(desc, test) {
    function whenWrapper(_setups) {
      return function() {
        var ctxt = this;
        R.forEach(function(fn) {
          fn.apply(ctxt);
        }, _setups);
        test.apply(this);
      };
    }
    _it(desc, whenWrapper(setups));
  }
  return function when(desc, setup, body) {
    var _it = it;
    self.it = whenIt;
    setups = R.prepend(setup, setups);
    describe('when '+desc, body);
    setups = R.tail(setups);
    self.it = _it;
  };
})();
