'use strict';

angular.module('clickApp.services')
  .factory('modelEffect', [
    function modelEffectServiceFactory() {
      return function(modelService) {
        var modelEffectService = {
          isEffectDisplayed: function modelIsEffectDisplayed(effect, model) {
            return !!R.find(R.equals(effect), R.defaultTo([], model.state.eff));
          },
          setEffectDisplay: function modelSetEffectDisplay(effect, set, model) {
            if(set) {
              model.state.eff = R.uniq(R.append(effect, R.defaultTo([], model.state.eff)));
            }
            else {
              model.state.eff = R.reject(R.equals(effect), R.defaultTo([], model.state.eff));
            }
          },
          toggleEffectDisplay: function modelToggleEffectDisplay(effect, model) {
            if(modelService.isEffectDisplayed(effect, model)) {
              model.state.eff = R.reject(R.equals(effect), R.defaultTo([], model.state.eff));
            }
            else {
              model.state.eff = R.append(effect, R.defaultTo([], model.state.eff));
            }
          },
        };
        return modelEffectService;
      };
    }
  ]);
