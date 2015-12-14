R.spy = (() => {
  return (...args) => {
    return (obj) => {
      console.log.apply(console, R.append(obj, args));
      return obj;
    };
  };
})();

R.spyError = (() => {
  return (...args) => {
    return (obj) => {
      console.error.apply(console, R.append(obj, args));
      return obj;
    };
  };
})();
