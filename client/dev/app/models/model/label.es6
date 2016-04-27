(function() {
  angular.module('clickApp.services')
    .factory('modelLabel', modelLabelModelFactory);

  modelLabelModelFactory.$inject = [];
  function modelLabelModelFactory() {
    const LABEL_LENS = R.lensPath(['state','l']);
    return () => {
      const modelLabelModel = {
        addLabel: modelAddLabel,
        removeLabel: modelRemoveLabel,
        clearLabel: modelClearLabel,
        fullLabel: modelFullLabel
      };
      return modelLabelModel;

      function modelAddLabel(label, model) {
        return R.over(
          LABEL_LENS,
          R.compose(R.uniq, R.append(label)),
          model
        );
      }
      function modelRemoveLabel(label, model) {
        return R.over(
          LABEL_LENS,
          R.reject(R.equals(label)),
          model
        );
      }
      function modelClearLabel(model) {
        return R.set(LABEL_LENS, [], model);
      }
      function modelFullLabel(model) {
        return R.defaultTo([], R.view(LABEL_LENS, model)).join(' ');
      }
    };
  }
})();
