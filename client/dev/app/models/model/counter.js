'use strict';

(function () {
  angular.module('clickApp.services').factory('modelCounter', modelCounterModelFactory);

  modelCounterModelFactory.$inject = [];
  function modelCounterModelFactory() {
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
        return !!R.find(R.equals(counter), model.state.dsp);
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
        if (set) {
          return R.over(R.lensPath(['state', 'dsp']), R.compose(R.uniq, R.append(counter)), model);
        } else {
          return R.over(R.lensPath(['state', 'dsp']), R.reject(R.equals(counter)), model);
        }
      }
      function modelToggleCounterDisplay(counter, model) {
        if (modelModel.isCounterDisplayed(counter, model)) {
          return R.over(R.lensPath(['state', 'dsp']), R.reject(R.equals(counter)), model);
        } else {
          return R.over(R.lensPath(['state', 'dsp']), R.append(counter), model);
        }
      }
    };
  }
})();
//# sourceMappingURL=counter.js.map
