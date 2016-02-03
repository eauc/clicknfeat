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
        return R.pipeP(
          () => {
            let context = R.bind(setup, this)();
            return self.Promise
              .resolve(context)
              .catch((error) => {
                console.warn('Setup error', _desc, error);
                this.catchError = R.pipe(
                  R.defaultTo([]),
                  R.append(error)
                )(this.catchError);
              });
          },
          (context) => {
            // console.log('context', _desc, context);
            this.context = context;
          },
          () => {
            return _wrapper(test).apply(this, [done]);
          }
        )();
      };
    };
    wrapper._debug = _desc;
    return wrapper;
  }
})();
