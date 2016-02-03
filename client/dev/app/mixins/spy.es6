(function() {
  R.spy = (...args) => {
    return (obj) => {
      console.log.apply(console, R.append(obj, args));
      return obj;
    };
  };
  R.spyDebug = (...args) => {
    return (obj) => {
      console.debug.apply(console, R.append(obj, args));
      return obj;
    };
  };
  R.spyInfo = (...args) => {
    return (obj) => {
      console.info.apply(console, R.append(obj, args));
      return obj;
    };
  };
  R.spyWarn = (...args) => {
    return (obj) => {
      console.warn.apply(console, R.append(obj, args));
      return obj;
    };
  };
  R.spyError = (...args) => {
    return (obj) => {
      console.error.apply(console, R.append(obj, args));
      return obj;
    };
  };
  R.spyAndDiscardError = (...args) => {
    return R.pipe(
      R.spyError.apply(R, args),
      R.always(null)
    );
  };
})();
