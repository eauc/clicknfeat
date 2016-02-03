'use strict';

(function () {
  RegExp.prototype.toJSON = RegExp.prototype.toString;

  self.example = function example(func, vals) {
    var keys = R.head(vals);
    R.pipe(R.always(vals), R.tail, R.map(function (row) {
      return R.addIndex(R.reduce)(function (mem, k, i) {
        mem[k] = row[i];
        return mem;
      }, {}, keys);
    }), R.forEach(function (e) {
      func(e, example.desc(e));
    }))();
  };

  self.example.desc = function exampleDesc(obj, prune_length) {
    prune_length = R.defaultTo(15, prune_length);
    return ['with { ', R.pipe(R.always(obj), R.keys, R.map(function (k) {
      var desc = R.type(obj[k]) === 'Function' ? 'func()' : s.prune(JSON.stringify(obj[k]), prune_length);
      return k + ': ' + desc;
    }), R.join(', '))(), ' }'].join('');
  };
})();
//# sourceMappingURL=example.js.map
