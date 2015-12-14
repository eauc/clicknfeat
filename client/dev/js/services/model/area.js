'use strict';

angular.module('clickApp.services').factory('modelArea', ['gameFactions', function modelAreaServiceFactory(gameFactionsService) {
  return function () /*modelService*/{
    var modelAreaService = {
      isCtrlAreaDisplayed: function modelIsCtrlAreaDisplayed(factions, model) {
        return R.pipeP(gameFactionsService.getModelInfo$(model.state.info), function (info) {
          return info.type === 'wardude' && ('Number' === R.type(info.focus) || 'Number' === R.type(info.fury)) && !!R.find(R.equals('a'), model.state.dsp);
        })(factions);
      },
      setCtrlAreaDisplay: function modelSetCtrlAreaDisplay(set, model) {
        if (set) {
          model.state.dsp = R.uniq(R.append('a', model.state.dsp));
        } else {
          model.state.dsp = R.reject(R.equals('a'), model.state.dsp);
        }
      },
      toggleCtrlAreaDisplay: function modelToggleCtrlAreaDisplay(model) {
        if (R.find(R.equals('a'), model.state.dsp)) {
          model.state.dsp = R.reject(R.equals('a'), model.state.dsp);
        } else {
          model.state.dsp = R.append('a', model.state.dsp);
        }
      },
      isAreaDisplayed: function modelIsAreaDisplayed(model) {
        return R.exists(model.state.are);
      },
      areaDisplay: function modelAreaDisplay(model) {
        return model.state.are;
      },
      setAreaDisplay: function modelSetAreaDisplay(area, model) {
        model.state.are = area;
      },
      toggleAreaDisplay: function modelToggleAreaDisplay(area, model) {
        model.state.are = area === model.state.are ? null : area;
      }
    };
    return modelAreaService;
  };
}]);
//# sourceMappingURL=area.js.map