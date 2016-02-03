(function() {
  R.thread = function thread(value) {
    return function(...fn) {
      return R.pipe.apply(R, fn)(value);
    };
  };
  R.threadP = function threadP(value) {
    return function(...fn) {
      return R.pipeP.apply(R, [
        R.always(self.Promise.resolve(value)),
        ...fn
      ])();
    };
  };
})();
