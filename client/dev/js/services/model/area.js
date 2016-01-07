'use strict';

angular.module('clickApp.services').factory('modelArea', ['gameFactions', function modelAreaServiceFactory(gameFactionsService) {
  return function () {
    var modelAreaService = {
      isCtrlAreaDisplayed: function modelIsCtrlAreaDisplayed(factions, model) {
        return R.pipeP(gameFactionsService.getModelInfo$(model.state.info), function (info) {
          return info.type === 'wardude' && ('Number' === R.type(info.focus) || 'Number' === R.type(info.fury)) && !!R.find(R.equals('a'), model.state.dsp);
        })(factions);
      },
      setCtrlAreaDisplay: function modelSetCtrlAreaDisplay(set, model) {
        if (set) {
          return R.over(R.lensPath(['state', 'dsp']), R.compose(R.uniq, R.append('a')), model);
        } else {
          return R.over(R.lensPath(['state', 'dsp']), R.reject(R.equals('a')), model);
        }
      },
      toggleCtrlAreaDisplay: function modelToggleCtrlAreaDisplay(model) {
        if (R.find(R.equals('a'), model.state.dsp)) {
          return R.over(R.lensPath(['state', 'dsp']), R.reject(R.equals('a')), model);
        } else {
          return R.over(R.lensPath(['state', 'dsp']), R.append('a'), model);
        }
      },
      isAreaDisplayed: function modelIsAreaDisplayed(model) {
        return R.exists(model.state.are);
      },
      areaDisplay: function modelAreaDisplay(model) {
        return model.state.are;
      },
      setAreaDisplay: function modelSetAreaDisplay(area, model) {
        return R.assocPath(['state', 'are'], area, model);
      },
      toggleAreaDisplay: function modelToggleAreaDisplay(area, model) {
        return R.over(R.lensPath(['state', 'are']), function (are) {
          return area === are ? null : area;
        }, model);
      }
    };
    return modelAreaService;
  };
}]);
//# sourceMappingURL=area.js.map
