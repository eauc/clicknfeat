'use strict';

angular.module('clickApp.services').factory('modelIncorporeal', [function modelIncorporealServiceFactory() {
  return function (modelService) {
    var modelIncorporealService = {
      isIncorporealDisplayed: function modelIsIncorporealDisplayed(model) {
        return !!R.find(R.equals('in'), model.state.dsp);
      },
      setIncorporealDisplay: function modelSetIncorporealDisplay(set, model) {
        if (set) {
          model.state.dsp = R.uniq(R.append('in', model.state.dsp));
        } else {
          model.state.dsp = R.reject(R.equals('in'), model.state.dsp);
        }
      },
      toggleIncorporealDisplay: function modelToggleIncorporealDisplay(model) {
        if (modelService.isIncorporealDisplayed(model)) {
          model.state.dsp = R.reject(R.equals('in'), model.state.dsp);
        } else {
          model.state.dsp = R.append('in', model.state.dsp);
        }
      }
    };
    return modelIncorporealService;
  };
}]);
//# sourceMappingURL=incorporeal.js.map
