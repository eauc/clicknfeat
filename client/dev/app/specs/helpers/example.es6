(function() {
  RegExp.prototype.toJSON = RegExp.prototype.toString;

  self.example = function example(func, vals) {
    var keys = R.head(vals);
    R.thread(vals)(
      R.tail,
      R.map((row) => {
        return R.addIndex(R.reduce)((mem, k, i) => {
          mem[k] = row[i];
          return mem;
        }, {}, keys);
      }),
      R.forEach((e) => {
        func(e, example.desc(e));
      })
    );
  };

  self.example.desc = function exampleDesc(obj, prune_length) {
    prune_length = R.defaultTo(15, prune_length);
    return [
      'with { ',
      R.thread(obj)(
        R.keys,
        R.map((k) => {
          const desc = (R.type(obj[k]) === 'Function')
                  ? 'func()'
                  : s.prune(JSON.stringify(obj[k]), prune_length);
          return `${k}: ${desc}`;
        }),
        R.join(', ')
      ),
      ' }'
    ].join('');
  };

})();
