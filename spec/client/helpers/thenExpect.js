'use strict';

self.it = (function() {
  var jasmine_it = it;
  var new_it = function thenExpectIt(desc, test) {
    return jasmine_it(desc, new_it.wrapper(test));
  };
  new_it.wrapper = function wrapper(test) {
    return function wrappedTest(done) {
      var _done = this._done;
      this._auto_call_done = (test.length === 0);
      this._done = done;
      test.apply(this, [done]);
      this._done = _done;
      if(this._auto_call_done) done();
    };
  };
  new_it.wrapper._debug = 'thenExpect';
  new_it.thenExpect = function thenExpect(promise, cbk) {
    this._auto_call_done = false;
    return promise.then(R.bind(cbk, this))
      .catch(function(error) {
        expect('This promise').not.toBe('rejected');
        expect(error).toBe(null);
      })
      .then(this._done);
  };
  new_it.thenExpectError = function thenExpectError(promise, cbk) {
    this._auto_call_done = false;
    return promise
      .then(function() { expect('This promise').toBe('rejected'); })
      .catch(R.bind(cbk, this))
      .catch(function(reason) {
        expect('This promise rejection').toBe('caught by test');
        expect(reason).toBe(null);
      })
      .then(this._done);
  };
  return new_it;
})();
