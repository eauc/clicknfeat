(function() {
  R.viewOr = R.curry((defaut, lens, obj) => {
    return R.defaultTo(defaut, R.view(lens, obj));
  });
})();
