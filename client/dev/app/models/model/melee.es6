(function() {
  angular.module('clickApp.services')
    .factory('modelMelee', modelMeleeServiceFactory);

  modelMeleeServiceFactory.$inject = [];
  function modelMeleeServiceFactory() {
    const DSP_LENS = R.lensPath(['state','dsp']);
    return function(modelService) {
      const modelMeleeService = {
        isMeleeDisplayed: modelIsMeleeDisplayed,
        setMeleeDisplay: modelSetMeleeDisplay,
        toggleMeleeDisplay: modelToggleMeleeDisplay
      };
      return modelMeleeService;

      function modelIsMeleeDisplayed(melee, model) {
        return !!R.find(R.equals(melee), model.state.dsp);
      }
      function modelSetMeleeDisplay(melee, set, model) {
        const update = ( set
                         ? R.compose(R.uniq, R.append(melee))
                         : R.reject(R.equals(melee))
                       );
        return R.over(DSP_LENS, update, model);
      }
      function modelToggleMeleeDisplay(melee, model) {
        const update = ( modelService.isMeleeDisplayed(melee, model)
                         ? R.reject(R.equals(melee))
                         : R.append(melee)
                       );
        return R.over(DSP_LENS, update, model);
      }
    };
  }
})();
