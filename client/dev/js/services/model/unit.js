'use strict';

angular.module('clickApp.services').factory('modelUnit', [function modelServiceFactory() {
  return function (modelService) {
    var modelUnitService = {
      isUnitDisplayed: function modelIsUnitDisplayed(model) {
        return !!R.find(R.equals('u'), model.state.dsp);
      },
      unit: function modelUnit(model) {
        return R.prop('u', model.state);
      },
      unitIs: function modelUnit(unit, model) {
        return R.propEq('u', unit, model.state);
      },
      setUnit: function modelSetUnit(unit, model) {
        return R.assocPath(['state', 'u'], unit, model);
      },
      setUnitDisplay: function modelSetUnitDisplay(set, model) {
        if (set) {
          return R.over(R.lensPath(['state', 'dsp']), R.compose(R.uniq, R.append('u')), model);
        } else {
          return R.over(R.lensPath(['state', 'dsp']), R.reject(R.equals('u')), model);
        }
      },
      toggleUnitDisplay: function modelToggleUnitDisplay(model) {
        if (modelService.isUnitDisplayed(model)) {
          return R.over(R.lensPath(['state', 'dsp']), R.reject(R.equals('u')), model);
        } else {
          return R.over(R.lensPath(['state', 'dsp']), R.append('u'), model);
        }
      }
    };
    return modelUnitService;
  };
}]);
//# sourceMappingURL=unit.js.map
