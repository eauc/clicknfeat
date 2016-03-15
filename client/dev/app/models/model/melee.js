'use strict';

(function () {
  angular.module('clickApp.services').factory('modelMelee', modelMeleeServiceFactory);

  modelMeleeServiceFactory.$inject = [];
  function modelMeleeServiceFactory() {
    return function (modelService) {
      var modelMeleeService = {
        isMeleeDisplayed: modelIsMeleeDisplayed,
        setMeleeDisplay: modelSetMeleeDisplay,
        toggleMeleeDisplay: modelToggleMeleeDisplay
      };
      return modelMeleeService;

      function modelIsMeleeDisplayed(melee, model) {
        return !!R.find(R.equals(melee), model.state.dsp);
      }
      function modelSetMeleeDisplay(melee, set, model) {
        if (set) {
          return R.over(R.lensPath(['state', 'dsp']), R.compose(R.uniq, R.append(melee)), model);
        } else {
          return R.over(R.lensPath(['state', 'dsp']), R.reject(R.equals(melee)), model);
        }
      }
      function modelToggleMeleeDisplay(melee, model) {
        if (modelService.isMeleeDisplayed(melee, model)) {
          return R.over(R.lensPath(['state', 'dsp']), R.reject(R.equals(melee)), model);
        } else {
          return R.over(R.lensPath(['state', 'dsp']), R.append(melee), model);
        }
      }
    };
  }
})();
//# sourceMappingURL=melee.js.map
