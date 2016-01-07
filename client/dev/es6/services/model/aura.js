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
            return R.assocPath(['state','aur'], aura, model);
          },
          toggleAuraDisplay: function modelToggleAuraDisplay(aura, model) {
            return R.over(R.lensPath(['state','aur']),
                          (aur) => { return (aura === aur) ? null : aura; },
                          model);
          }
        };
        return modelAuraService;
      };
    }
  ]);
