(function() {
  angular.module('clickApp.services')
    .factory('modelUnit', modelModelFactory);

  modelModelFactory.$inject = [];
  function modelModelFactory() {
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
        return !!R.find(R.equals('u'), model.state.dsp);
      }
      function modelUnit(model) {
        return R.prop('u', model.state);
      }
      function modelUnitIs(unit, model) {
        return R.propEq('u', unit, model.state);
      }
      function modelSetUnit(unit, model) {
        return R.assocPath(['state','u'], unit, model);
      }
      function modelSetUnitDisplay(set, model) {
        if(set) {
          return R.over(R.lensPath(['state','dsp']),
                        R.compose(R.uniq, R.append('u')),
                        model);
        }
        else {
          return R.over(R.lensPath(['state','dsp']),
                        R.reject(R.equals('u')),
                        model);
        }
      }
      function modelToggleUnitDisplay(model) {
        if(modelModel.isUnitDisplayed(model)) {
          return R.over(R.lensPath(['state','dsp']),
                        R.reject(R.equals('u')),
                        model);
        }
        else {
          return R.over(R.lensPath(['state','dsp']),
                        R.append('u'),
                        model);
        }
      }
    };
  }
})();
