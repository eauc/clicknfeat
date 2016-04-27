(function() {
  angular.module('clickApp.services')
    .factory('modelUnit', modelModelFactory);

  modelModelFactory.$inject = [];
  function modelModelFactory() {
    const DSP_LENS = R.lensPath(['state','dsp']);
    const UNIT_LENS = R.lensPath(['state','u']);
    return (modelModel) => {
      const modelUnitModel = {
        isUnitDisplayed: modelIsUnitDisplayed,
        unit: modelUnit,
        unitIs: modelUnitIs,
        setUnit: modelSetUnit,
        setUnitDisplay: modelSetUnitDisplay,
        toggleUnitDisplay: modelToggleUnitDisplay
      };
      return modelUnitModel;

      function modelIsUnitDisplayed(model) {
        return !!R.find(R.equals('u'), R.viewOr([], DSP_LENS, model));
      }
      function modelUnit(model) {
        return R.viewOr(0, UNIT_LENS, model);
      }
      function modelUnitIs(unit, model) {
        return unit === R.view(UNIT_LENS, model);
      }
      function modelSetUnit(unit, model) {
        return R.set(UNIT_LENS, unit, model);
      }
      function modelSetUnitDisplay(set, model) {
        const update = ( set
                         ? R.compose(R.uniq, R.append('u'))
                         : R.reject(R.equals('u'))
                       );
        return R.over(DSP_LENS, update, model);
      }
      function modelToggleUnitDisplay(model) {
        const update = ( modelModel.isUnitDisplayed(model)
                         ? R.reject(R.equals('u'))
                         : R.append('u')
                       );
        return R.over(DSP_LENS, update, model);
      }
    };
  }
})();
