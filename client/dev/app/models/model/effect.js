'use strict';

(function () {
  angular.module('clickApp.services').factory('modelEffect', modelEffectServiceFactory);

  modelEffectServiceFactory.$inject = [];
  function modelEffectServiceFactory() {
    return function (modelService) {
      var modelEffectService = {
        isEffectDisplayed: modelIsEffectDisplayed,
        setEffectDisplay: modelSetEffectDisplay,
        toggleEffectDisplay: modelToggleEffectDisplay
      };
      return modelEffectService;

      function modelIsEffectDisplayed(effect, model) {
        return !!R.find(R.equals(effect), R.pathOr([], ['state', 'eff'], model));
      }
      function modelSetEffectDisplay(effect, set, model) {
        if (set) {
          return R.over(R.lensPath(['state', 'eff']), R.compose(R.uniq, R.append(effect), R.defaultTo([])), model);
        } else {
          return R.over(R.lensPath(['state', 'eff']), R.compose(R.reject(R.equals(effect)), R.defaultTo([])), model);
        }
      }
      function modelToggleEffectDisplay(effect, model) {
        if (modelService.isEffectDisplayed(effect, model)) {
          return R.over(R.lensPath(['state', 'eff']), R.compose(R.reject(R.equals(effect)), R.defaultTo([])), model);
        } else {
          return R.over(R.lensPath(['state', 'eff']), R.compose(R.append(effect), R.defaultTo([])), model);
        }
      }
    };
  }
})();
//# sourceMappingURL=effect.js.map
