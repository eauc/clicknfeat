'use strict';

self.mockReturnPromise = (function() {
  return function mockReturnPromise(spy) {
    spy.and.callFake(function() {
      var args = Array.prototype.slice.apply(arguments);
      spy.promise = new self.Promise(function(resolve, reject) {
        spy.resolve = resolve;
        spy.reject = reject;
        if(R.exists(spy.rejectWith)) {
          var reject_val = ( R.type(spy.rejectWith) === 'Function' ?
                             spy.rejectWith.apply(null, args) :
                             spy.rejectWith
                           );
          reject(reject_val);
        }
        if(R.exists(spy.resolveWith)) {
          var resolve_val = ( R.type(spy.resolveWith) === 'Function' ?
                             spy.resolveWith.apply(null, args) :
                             spy.resolveWith
                           );
          resolve(resolve_val);
        }
      });
      return spy.promise;
    });
  };
})();
