'use strict';

self.when = (function() {
  function whenWrapper(_wrapper, _desc, setup) {
    var wrapper = function(test) {
      // console.error('wrapper', _desc, '_wrapper', _wrapper._debug);
      return function(done) {
        // console.error('test', _desc, '_wrapper', _wrapper._debug);
        setup.apply(this);
        _wrapper(test).apply(this, [done]);
      };
    };
    wrapper._debug = _desc;
    return wrapper;
  }  
  return function when(desc, setup, body) {
    var _wrapper = self.it.wrapper;
    // console.error('when', desc, '_wrapper', _wrapper._debug);
    self.it.wrapper = whenWrapper(_wrapper, desc, setup);
    self.describe('when '+desc, body);
    self.it.wrapper = _wrapper;
  };
})();

self.xwhen = (function() {
  return function xwhen(desc, setup, body) {
    self.xdescribe('when '+desc, body);
  };
})();
