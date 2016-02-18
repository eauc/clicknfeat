(function() {
  self.spyOnPromise = function spyOnPromise(object, key) {
    const spy = spyOn(object, key);

    return self.spyReturnPromise(spy);
  };
  self.spyReturnPromise = function spyReturnPromise(spy) {
    let resolve_value;
    let reject_value;
    spy.resolveWith = (...args) => {
      resolve_value = args;
    };
    spy.rejectWith = (...args) => {
      reject_value = args;
    };
    spy.and.callFake(resolveFakePromise);
    return spy;

    function resolveFakePromise(...args) {
      return new self.Promise((resolve, reject) => {
        spy.resolve = resolve;
        spy.reject = reject;

        if(R.exists(reject_value)) {
          if(R.length(reject_value) === 1 &&
             R.type(reject_value[0]) === 'Function') {
            reject(reject_value[0].apply(null, args));
          }
          else {
            reject.apply(null, reject_value);
          }
        }
        if(R.exists(resolve_value)) {
          if(R.length(resolve_value) === 1 &&
             R.type(resolve_value[0]) === 'Function') {
            resolve(resolve_value[0].apply(null, args));
          }
          else {
            resolve.apply(null, resolve_value);
          }
        }
      });
    }
  };
})();
