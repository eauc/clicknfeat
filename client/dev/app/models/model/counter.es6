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
            return R.assocPath(['state', counter], value, model);
          },
          decrementCounter: function modelDecrementCounter(counter, model) {
            var value = Math.max(0, R.defaultTo(0, model.state[counter]) - 1);
            return R.assocPath(['state', counter], value, model);
          },
          setCounterDisplay: function modelSetCounterDisplay(counter, set, model) {
            if(set) {
              return R.over(R.lensPath(['state','dsp']),
                            R.compose(R.uniq, R.append(counter)),
                            model);
            }
            else {
              return R.over(R.lensPath(['state','dsp']),
                            R.reject(R.equals(counter)),
                            model);
            }
          },
          toggleCounterDisplay: function modelToggleCounterDisplay(counter, model) {
            if(modelService.isCounterDisplayed(counter, model)) {
              return R.over(R.lensPath(['state','dsp']),
                            R.reject(R.equals(counter)),
                            model);
            }
            else {
              return R.over(R.lensPath(['state','dsp']),
                            R.append(counter),
                            model);
            }
          }
        };
        return modelCounterService;
      };
    }
  ]);
