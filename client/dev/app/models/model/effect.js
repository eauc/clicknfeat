'use strict';

(function () {
  angular.module('clickApp.services').factory('modelEffect', modelEffectServiceFactory);

  modelEffectServiceFactory.$inject = [];
  function modelEffectServiceFactory() {
    var EFFECT_LENS = R.lensPath(['state', 'eff']);
    return function (modelService) {
      var modelEffectService = {
        isEffectDisplayed: modelIsEffectDisplayed,
        setEffectDisplay: modelSetEffectDisplay,
        toggleEffectDisplay: modelToggleEffectDisplay
      };
      return modelEffectService;

      function modelIsEffectDisplayed(effect, model) {
        return !!R.find(R.equals(effect), R.viewOr([], EFFECT_LENS, model));
      }
      function modelSetEffectDisplay(effect, set, model) {
        var update = set ? R.compose(R.uniq, R.append(effect), R.defaultTo([])) : R.compose(R.reject(R.equals(effect)), R.defaultTo([]));
        return R.over(EFFECT_LENS, update, model);
      }
      function modelToggleEffectDisplay(effect, model) {
        var update = modelService.isEffectDisplayed(effect, model) ? R.compose(R.reject(R.equals(effect)), R.defaultTo([])) : R.compose(R.append(effect), R.defaultTo([]));
        return R.over(EFFECT_LENS, update, model);
      }
    };
  }
})();
//# sourceMappingURL=effect.js.map
