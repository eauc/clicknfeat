'use strict';

self.using = (function() {
  RegExp.prototype.toJSON = RegExp.prototype.toString;
  function using(vals, func) {
    var keys = R.head(vals);
    R.pipe(
      R.tail,
      R.map(function(row) {
        return R.reduceIndexed(function(mem, k, i) {
          mem[k] = row[i];
          return mem;
        }, {}, keys);
      }),
      R.forEach(function(e) {
        func(e, using.desc(e));
      })
    )(vals);
  }
  using.desc = function usingDesc(obj, prune_length) {
    prune_length = R.defaultTo(15, prune_length);
    return 'with { ' + R.pipe(
      R.keys,
      R.map(function(k) {
        return k + ': ' +
          (R.type(obj[k]) === 'Function' ?
           'func()' :
           s.prune(JSON.stringify(obj[k]), prune_length)
          );
      }),
      R.join(', ')
    )(obj) + ' }';
  };
  return using;
})();
