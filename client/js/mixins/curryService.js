R.curryService= (function() {
  return function(obj) {
    R.pipe(R.functions,
           R.reject(R.match(/\$$/)),
           R.forEach(function(k) {
             obj[k+'$'] = R.curry(obj[k]);
           })
          )(obj);
  };
})();
