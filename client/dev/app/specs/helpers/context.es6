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
        console.log('wrapper', _desc);
        this.expectContextError = function() {
          this._context_expect_error = true;
        };
        const context = new self.Promise((resolve, reject) => {
          try {
            resolve(R.bind(setup, this)());
          }
          catch(e) {
            reject(e);
          }
        }).catch((error) => {
          console.warn('Setup error', _desc, error);
          this.contextError = R.thread(this.contextError)(
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
            if(!this._context_expect_error &&
               R.exists(this.contextError)) {
              expect('This context').toBe('not rejected');
              expect(this.contextError)
                .toBe(undefined);
            }
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
