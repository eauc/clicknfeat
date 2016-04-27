'use strict';

(function () {
  angular.module('clickApp.services').factory('modelAura', modelAuraModelFactory);

  modelAuraModelFactory.$inject = [];
  function modelAuraModelFactory() {
    var AURA_LENS = R.lensPath(['state', 'aur']);
    return function () {
      var modelAuraModel = {
        isAuraDisplayed: modelIsAuraDisplayed,
        auraDisplay: modelAuraDisplay,
        setAuraDisplay: modelSetAuraDisplay,
        toggleAuraDisplay: modelToggleAuraDisplay
      };
      return modelAuraModel;

      function modelIsAuraDisplayed(model) {
        return R.exists(R.view(AURA_LENS, model));
      }
      function modelAuraDisplay(model) {
        return R.view(AURA_LENS, model);
      }
      function modelSetAuraDisplay(aura, model) {
        return R.set(AURA_LENS, aura, model);
      }
      function modelToggleAuraDisplay(aura, model) {
        return R.over(AURA_LENS, function (aur) {
          return aura === aur ? null : aura;
        }, model);
      }
    };
  }
})();
//# sourceMappingURL=aura.js.map
