R.spy = (function() {
  return function() {
    var args = R.slice(0, arguments.length, arguments);
    return function(obj) {
      console.log.apply(console, R.append(obj, args));
      return obj;
    };
  };
})();
