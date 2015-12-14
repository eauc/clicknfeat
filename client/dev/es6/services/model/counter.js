'use strict';

angular.module('clickApp.services')
  .factory('modelCounter', [
    function modelCounterServiceFactory() {
      return function(modelService) {
        var modelCounterService = {
          isCounterDisplayed: function modelIsCounterDisplayed(counter, model) {
            return !!R.find(R.equals(counter), model.state.dsp);
          },
          incrementCounter: function modelIncrementCounter(counter, model) {
            var value = R.defaultTo(0, model.state[counter]) + 1;
            model.state = R.assoc(counter, value, model.state);
          },
          decrementCounter: function modelDecrementCounter(counter, model) {
            var value = Math.max(0, R.defaultTo(0, model.state[counter]) - 1);
            model.state = R.assoc(counter, value, model.state);
          },
          setCounterDisplay: function modelSetCounterDisplay(counter, set, model) {
            if(set) {
              model.state.dsp = R.uniq(R.append(counter, model.state.dsp));
            }
            else {
              model.state.dsp = R.reject(R.equals(counter), model.state.dsp);
            }
          },
          toggleCounterDisplay: function modelToggleCounterDisplay(counter, model) {
            if(modelService.isCounterDisplayed(counter, model)) {
              model.state.dsp = R.reject(R.equals(counter), model.state.dsp);
            }
            else {
              model.state.dsp = R.append(counter, model.state.dsp);
            }
          },
        };
        return modelCounterService;
      };
    }
  ]);
