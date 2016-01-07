'use strict';

angular.module('clickApp.services').factory('modelMelee', [function modelMeleeServiceFactory() {
  return function (modelService) {
    var modelMeleeService = {
      isMeleeDisplayed: function modelIsMeleeDisplayed(melee, model) {
        return !!R.find(R.equals(melee), model.state.dsp);
      },
      setMeleeDisplay: function modelSetMeleeDisplay(melee, set, model) {
        if (set) {
          return R.over(R.lensPath(['state', 'dsp']), R.compose(R.uniq, R.append(melee)), model);
        } else {
          return R.over(R.lensPath(['state', 'dsp']), R.reject(R.equals(melee)), model);
        }
      },
      toggleMeleeDisplay: function modelToggleMeleeDisplay(melee, model) {
        if (modelService.isMeleeDisplayed(melee, model)) {
          return R.over(R.lensPath(['state', 'dsp']), R.reject(R.equals(melee)), model);
        } else {
          return R.over(R.lensPath(['state', 'dsp']), R.append(melee), model);
        }
      }
    };
    return modelMeleeService;
  };
}]);
//# sourceMappingURL=melee.js.map
