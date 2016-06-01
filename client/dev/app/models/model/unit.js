'use strict';

(function () {
  angular.module('clickApp.services').factory('modelUnit', modelModelFactory);

  modelModelFactory.$inject = [];
  function modelModelFactory() {
    var DSP_LENS = R.lensPath(['state', 'dsp']);
    var UNIT_LENS = R.lensPath(['state', 'u']);
    return function (modelModel) {
      var modelUnitModel = {
        isUnitDisplayed: modelIsUnitDisplayed,
        unit: modelUnit,
        unitIs: modelUnitIs,
        setUnit: modelSetUnit,
        setUnitDisplay: modelSetUnitDisplay,
        toggleUnitDisplay: modelToggleUnitDisplay,
        renderUnit: modelRenderUnit
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
        var update = set ? R.compose(R.uniq, R.append('u')) : R.reject(R.equals('u'));
        return R.over(DSP_LENS, update, model);
      }
      function modelToggleUnitDisplay(model) {
        var update = modelModel.isUnitDisplayed(model) ? R.reject(R.equals('u')) : R.append('u');
        return R.over(DSP_LENS, update, model);
      }
      function modelRenderUnit(_ref, model) {
        var base = _ref.base;
        var cx = _ref.cx;
        var cy = _ref.cy;

        var radius = model.info.base_radius;
        var unit_options = {
          rotate: -model.state.r,
          flip_center: { x: cx, y: cy },
          text_center: { x: cx - radius * 0.7 - 5,
            y: cy - radius * 0.7 - 5 }
        };
        var unit = base.renderText(unit_options, 'U' + modelModel.unit(model));
        unit.show = modelModel.isUnitDisplayed(model);
        unit.cx = unit.x - 10;
        unit.cy = unit.y - 10;
        return { unit: unit };
      }
    };
  }
})();
//# sourceMappingURL=unit.js.map
