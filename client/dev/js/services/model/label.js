'use strict';

angular.module('clickApp.services').factory('modelLabel', [function modelLabelServiceFactory() {
  return function () /*modelService*/{
    var modelLabelService = {
      addLabel: function modelAddLabel(label, model) {
        model.state.l = R.uniq(R.append(label, model.state.l));
      },
      removeLabel: function modelRemoveLabel(label, model) {
        model.state.l = R.reject(R.equals(label), model.state.l);
      },
      clearLabel: function modelClearLabel(model) {
        model.state.l = [];
      },
      fullLabel: function modelFullLabel(model) {
        return model.state.l.join(' ');
      }
    };
    return modelLabelService;
  };
}]);
//# sourceMappingURL=label.js.map
