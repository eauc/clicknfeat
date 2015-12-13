'use strict';

angular.module('clickApp.services')
  .factory('modelAura', [
    function modelAuraServiceFactory() {
      return function(/*modelService*/) {
        var modelAuraService = {
          isAuraDisplayed: function modelIsAuraDisplayed(model) {
            return R.exists(model.state.aur);
          },
          auraDisplay: function modelAuraDisplay(model) {
            return model.state.aur;
          },
          setAuraDisplay: function modelSetAuraDisplay(aura, model) {
            model.state.aur = aura;
          },
          toggleAuraDisplay: function modelToggleAuraDisplay(aura, model) {
            model.state.aur = (aura === model.state.aur) ? null : aura;
          },
        };
        return modelAuraService;
      };
    }
  ]);
