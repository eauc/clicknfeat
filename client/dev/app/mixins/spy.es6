R.spy = (() => {
  return (...args) => {
    return (obj) => {
      console.log.apply(console, R.append(obj, args));
      return obj;
    };
  };
})();

R.spyDebug = (() => {
  return (...args) => {
    return (obj) => {
      console.debug.apply(console, R.append(obj, args));
      return obj;
    };
  };
})();

R.spyInfo = (() => {
  return (...args) => {
    return (obj) => {
      console.info.apply(console, R.append(obj, args));
      return obj;
    };
  };
})();

R.spyWarn = (() => {
  return (...args) => {
    return (obj) => {
      console.warn.apply(console, R.append(obj, args));
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
