R.curryService= (function() {
  return function(obj) {
    R.pipe(R.functions,
           R.reject(R.compose(R.not, R.isEmpty, R.match(/\$$/))),
           R.forEach((k) => {
             obj[k+'$'] = R.curry(obj[k]);
           })
          )(obj);
  };
})();
