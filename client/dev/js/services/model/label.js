'use strict';

angular.module('clickApp.services').factory('modelLabel', [function modelLabelServiceFactory() {
  return function () /*modelService*/{
    var modelLabelService = {
      addLabel: function modelAddLabel(label, model) {
        return R.over(R.lensPath(['state', 'l']), R.compose(R.uniq, R.append(label)), model);
      },
      removeLabel: function modelRemoveLabel(label, model) {
        return R.over(R.lensPath(['state', 'l']), R.reject(R.equals(label)), model);
      },
      clearLabel: function modelClearLabel(model) {
        return R.assocPath(['state', 'l'], [], model);
      },
      fullLabel: function modelFullLabel(model) {
        return R.pathOr([], ['state', 'l'], model).join(' ');
      }
    };
    return modelLabelService;
  };
}]);
//# sourceMappingURL=label.js.map
