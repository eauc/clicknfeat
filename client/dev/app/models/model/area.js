'use strict';

(function () {
  angular.module('clickApp.services').factory('modelArea', modelAreaModelFactory);

  modelAreaModelFactory.$inject = ['gameFactions'];
  function modelAreaModelFactory(gameFactionsModel) {
    var DSP_LENS = R.lensPath(['state', 'dsp']);
    var AREA_LENS = R.lensPath(['state', 'are']);
    return function () {
      var modelAreaModel = {
        isCtrlAreaDisplayed: modelIsCtrlAreaDisplayed,
        setCtrlAreaDisplay: modelSetCtrlAreaDisplay,
        toggleCtrlAreaDisplay: modelToggleCtrlAreaDisplay,
        isAreaDisplayed: modelIsAreaDisplayed,
        areaDisplay: modelAreaDisplay,
        setAreaDisplay: modelSetAreaDisplay,
        toggleAreaDisplay: modelToggleAreaDisplay,
        renderArea: modelRenderArea
      };
      return modelAreaModel;

      function modelIsCtrlAreaDisplayed(factions, model) {
        return R.thread(factions)(gameFactionsModel.getModelInfo$(model.state.info), R.ifElse(R.isNil, function () {
          return false;
        }, function (info) {
          return info.type === 'wardude' && ('Number' === R.type(info.focus) || 'Number' === R.type(info.fury)) && !!R.find(R.equals('a'), R.viewOr([], DSP_LENS, model));
        }));
      }
      function modelSetCtrlAreaDisplay(set, model) {
        var update = set ? R.compose(R.uniq, R.append('a')) : R.reject(R.equals('a'));
        return R.over(DSP_LENS, update, model);
      }
      function modelToggleCtrlAreaDisplay(model) {
        var update = R.find(R.equals('a'), model.state.dsp) ? R.reject(R.equals('a')) : R.append('a');
        return R.over(DSP_LENS, update, model);
      }
      function modelIsAreaDisplayed(model) {
        return R.exists(R.view(AREA_LENS, model));
      }
      function modelAreaDisplay(model) {
        return R.view(AREA_LENS, model);
      }
      function modelSetAreaDisplay(area, model) {
        return R.set(AREA_LENS, area, model);
      }
      function modelToggleAreaDisplay(area, model) {
        return R.over(AREA_LENS, function (are) {
          return area === are ? null : area;
        }, model);
      }
      function modelRenderArea(_ref, factions, state) {
        var info = _ref.info;
        var radius = _ref.radius;

        var area = modelAreaModel.isAreaDisplayed({ state: state }) ? modelAreaModel.areaDisplay({ state: state }) * 10 + radius : null;
        var ctrl = modelAreaModel.isCtrlAreaDisplayed(factions, { state: state }) ? (info.focus || info.fury) * 20 + radius : null;
        return {
          area: area,
          ctrl: ctrl
        };
      }
    };
  }
})();
//# sourceMappingURL=area.js.map
