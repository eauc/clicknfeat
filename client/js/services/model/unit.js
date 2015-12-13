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
        model.state = R.assoc('u', unit, model.state);
      },
      setUnitDisplay: function modelSetUnitDisplay(set, model) {
        if (set) {
          model.state.dsp = R.uniq(R.append('u', model.state.dsp));
        } else {
          model.state.dsp = R.reject(R.equals('u'), model.state.dsp);
        }
      },
      toggleUnitDisplay: function modelToggleUnitDisplay(model) {
        if (modelService.isUnitDisplayed(model)) {
          model.state.dsp = R.reject(R.equals('u'), model.state.dsp);
        } else {
          model.state.dsp = R.append('u', model.state.dsp);
        }
      }
    };
    return modelUnitService;
  };
}]);
//# sourceMappingURL=unit.js.map
