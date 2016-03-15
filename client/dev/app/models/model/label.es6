(function() {
  angular.module('clickApp.services')
    .factory('modelLabel', modelLabelModelFactory);

  modelLabelModelFactory.$inject = [];
  function modelLabelModelFactory() {
    return () => {
      const modelLabelModel = {
        addLabel: modelAddLabel,
        removeLabel: modelRemoveLabel,
        clearLabel: modelClearLabel,
        fullLabel: modelFullLabel
      };
      return modelLabelModel;

      function modelAddLabel(label, model) {
        return R.over(R.lensPath(['state','l']),
                      R.compose(R.uniq, R.append(label)),
                      model);
      }
      function modelRemoveLabel(label, model) {
        return R.over(R.lensPath(['state','l']),
                      R.reject(R.equals(label)),
                      model);
      }
      function modelClearLabel(model) {
        return R.assocPath(['state','l'], [], model);
      }
      function modelFullLabel(model) {
        return R.pathOr([], ['state','l'], model).join(' ');
      }
    };
  }
})();
