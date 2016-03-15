'use strict';

(function () {
  angular.module('clickApp.services').factory('modelIncorporeal', modelIncorporealModelFactory);

  modelIncorporealModelFactory.$inject = [];
  function modelIncorporealModelFactory() {
    return function (modelModel) {
      var modelIncorporealModel = {
        isIncorporealDisplayed: modelIsIncorporealDisplayed,
        setIncorporealDisplay: modelSetIncorporealDisplay,
        toggleIncorporealDisplay: modelToggleIncorporealDisplay
      };
      return modelIncorporealModel;

      function modelIsIncorporealDisplayed(model) {
        return !!R.find(R.equals('in'), model.state.dsp);
      }
      function modelSetIncorporealDisplay(set, model) {
        if (set) {
          return R.over(R.lensPath(['state', 'dsp']), R.compose(R.uniq, R.append('in')), model);
        } else {
          return R.over(R.lensPath(['state', 'dsp']), R.reject(R.equals('in')), model);
        }
      }
      function modelToggleIncorporealDisplay(model) {
        if (modelModel.isIncorporealDisplayed(model)) {
          return R.over(R.lensPath(['state', 'dsp']), R.reject(R.equals('in')), model);
        } else {
          return R.over(R.lensPath(['state', 'dsp']), R.append('in'), model);
        }
      }
    };
  }
})();
//# sourceMappingURL=incorporeal.js.map
