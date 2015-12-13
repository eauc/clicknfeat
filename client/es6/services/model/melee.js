'use strict';

angular.module('clickApp.services')
  .factory('modelMelee', [
    function modelMeleeServiceFactory() {
      return function(modelService) {
        var modelMeleeService = {
          isMeleeDisplayed: function modelIsMeleeDisplayed(melee, model) {
            return !!R.find(R.equals(melee), model.state.dsp);
          },
          setMeleeDisplay: function modelSetMeleeDisplay(melee, set, model) {
            if(set) {
              model.state.dsp = R.uniq(R.append(melee, model.state.dsp));
            }
            else {
              model.state.dsp = R.reject(R.equals(melee), model.state.dsp);
            }
          },
          toggleMeleeDisplay: function modelToggleMeleeDisplay(melee, model) {
            if(modelService.isMeleeDisplayed(melee, model)) {
              model.state.dsp = R.reject(R.equals(melee), model.state.dsp);
            }
            else {
              model.state.dsp = R.append(melee, model.state.dsp);
            }
          },
        };
        return modelMeleeService;
      };
    }
  ]);
