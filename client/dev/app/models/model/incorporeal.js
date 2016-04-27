'use strict';

(function () {
  angular.module('clickApp.services').factory('modelIncorporeal', modelIncorporealModelFactory);

  modelIncorporealModelFactory.$inject = [];
  function modelIncorporealModelFactory() {
    var DSP_LENS = R.lensPath(['state', 'dsp']);
    return function (modelModel) {
      var modelIncorporealModel = {
        isIncorporealDisplayed: modelIsIncorporealDisplayed,
        setIncorporealDisplay: modelSetIncorporealDisplay,
        toggleIncorporealDisplay: modelToggleIncorporealDisplay
      };
      return modelIncorporealModel;

      function modelIsIncorporealDisplayed(model) {
        return !!R.find(R.equals('in'), R.viewOr([], DSP_LENS, model));
      }
      function modelSetIncorporealDisplay(set, model) {
        var update = set ? R.compose(R.uniq, R.append('in')) : R.reject(R.equals('in'));
        return R.over(DSP_LENS, update, model);
      }
      function modelToggleIncorporealDisplay(model) {
        var update = modelModel.isIncorporealDisplayed(model) ? R.reject(R.equals('in')) : R.append('in');
        return R.over(DSP_LENS, update, model);
      }
    };
  }
})();
//# sourceMappingURL=incorporeal.js.map
