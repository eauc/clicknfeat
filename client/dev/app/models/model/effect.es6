(function() {
  angular.module('clickApp.services')
    .factory('modelEffect', modelEffectServiceFactory);

  modelEffectServiceFactory.$inject = [];
  function modelEffectServiceFactory() {
    const EFFECT_LENS = R.lensPath(['state','eff']);
    return (modelService) => {
      const modelEffectService = {
        isEffectDisplayed: modelIsEffectDisplayed,
        setEffectDisplay: modelSetEffectDisplay,
        toggleEffectDisplay: modelToggleEffectDisplay
      };
      return modelEffectService;

      function modelIsEffectDisplayed(effect, model) {
        return !!R.find(R.equals(effect), R.viewOr([], EFFECT_LENS, model));
      }
      function modelSetEffectDisplay(effect, set, model) {
        const update = ( set
                         ? R.compose(R.uniq, R.append(effect), R.defaultTo([]))
                         : R.compose(R.reject(R.equals(effect)), R.defaultTo([]))
                       );
        return R.over(EFFECT_LENS, update, model);
      }
      function modelToggleEffectDisplay(effect, model) {
        const update = ( modelService.isEffectDisplayed(effect, model)
                         ? R.compose(R.reject(R.equals(effect)), R.defaultTo([]))
                         : R.compose(R.append(effect), R.defaultTo([]))
                       );
        return R.over(EFFECT_LENS, update, model);
      }
    };
  }
})();
