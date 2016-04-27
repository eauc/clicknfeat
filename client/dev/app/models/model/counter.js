'use strict';

(function () {
  angular.module('clickApp.services').factory('modelCounter', modelCounterModelFactory);

  modelCounterModelFactory.$inject = [];
  function modelCounterModelFactory() {
    var DSP_LENS = R.lensPath(['state', 'dsp']);
    return function (modelModel) {
      var modelCounterModel = {
        isCounterDisplayed: modelIsCounterDisplayed,
        incrementCounter: modelIncrementCounter,
        decrementCounter: modelDecrementCounter,
        setCounterDisplay: modelSetCounterDisplay,
        toggleCounterDisplay: modelToggleCounterDisplay
      };
      return modelCounterModel;

      function modelIsCounterDisplayed(counter, model) {
        return !!R.find(R.equals(counter), R.viewOr([], DSP_LENS, model));
      }
      function modelIncrementCounter(counter, model) {
        var value = R.defaultTo(0, model.state[counter]) + 1;
        return R.assocPath(['state', counter], value, model);
      }
      function modelDecrementCounter(counter, model) {
        var value = Math.max(0, R.defaultTo(0, model.state[counter]) - 1);
        return R.assocPath(['state', counter], value, model);
      }
      function modelSetCounterDisplay(counter, set, model) {
        var update = set ? R.compose(R.uniq, R.append(counter)) : R.reject(R.equals(counter));
        return R.over(DSP_LENS, update, model);
      }
      function modelToggleCounterDisplay(counter, model) {
        var update = modelModel.isCounterDisplayed(counter, model) ? R.reject(R.equals(counter)) : R.append(counter);
        return R.over(DSP_LENS, update, model);
      }
    };
  }
})();
//# sourceMappingURL=counter.js.map
