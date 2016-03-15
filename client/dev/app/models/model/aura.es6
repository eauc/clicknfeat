(function() {
  angular.module('clickApp.services')
    .factory('modelAura', modelAuraModelFactory);

  modelAuraModelFactory.$inject = [];
  function modelAuraModelFactory() {
    return () => {
      const modelAuraModel = {
        isAuraDisplayed: modelIsAuraDisplayed,
        auraDisplay: modelAuraDisplay,
        setAuraDisplay: modelSetAuraDisplay,
        toggleAuraDisplay: modelToggleAuraDisplay
      };
      return modelAuraModel;

      function modelIsAuraDisplayed(model) {
        return R.exists(model.state.aur);
      }
      function modelAuraDisplay(model) {
        return model.state.aur;
      }
      function modelSetAuraDisplay(aura, model) {
        return R.assocPath(['state','aur'], aura, model);
      }
      function modelToggleAuraDisplay(aura, model) {
        return R.over(R.lensPath(['state','aur']),
                      (aur) => { return (aura === aur) ? null : aura; },
                      model);
      }
    };
  }
})();
