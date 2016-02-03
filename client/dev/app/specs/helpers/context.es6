(function() {
  self.context = function context(desc, setup, body) {
    // console.log('context', desc);
    let _wrapper = self.it.wrapper;
    self.it.wrapper = contextWrapper(_wrapper, desc, setup);
    self.describe(desc, body);
    self.it.wrapper = _wrapper;
  };

  self.xcontext = function xcontext(desc, setup, body) {
    self.xdescribe(desc, body);
  };

  function contextWrapper(_wrapper, _desc, setup) {
    let wrapper = function(test) {
      return function(done) {
        // console.log('wrapper', _desc);
        const context = self.Promise
                .resolve(R.bind(setup, this)())
                .catch((error) => {
                  console.warn('Setup error', _desc, error);
                  this.catchError = R.thread(this.catchError)(
                    R.defaultTo([]),
                    R.append(error)
                  );
                });
        return R.threadP(context)(
          (context) => {
            // console.log('context', _desc, context);
            this.context = context;
          },
          () => {
            return _wrapper(test).apply(this, [done]);
          }
        );
      };
    };
    wrapper._debug = _desc;
    return wrapper;
  }
})();
