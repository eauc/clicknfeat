'use strict';

(function () {
  angular.module('clickApp.models').factory('aoeTemplate', aoeTemplateModelFactory);

  aoeTemplateModelFactory.$inject = ['template', 'point'];
  function aoeTemplateModelFactory(templateModel, pointModel) {
    var SIZE_LENS = R.lensPath(['state', 's']);
    var MAX_DEVIATION_LENS = R.lensPath(['state', 'm']);
    var aoeTemplateModel = Object.create(templateModel);
    R.deepExtend(aoeTemplateModel, {
      _create: aoeTemplateCreate,
      setSizeP: aoeTemplateSetSizeP,
      size: aoeTemplateSize,
      deviate: aoeTemplateDeviateP,
      maxDeviation: aoeTemplateMaxDeviation,
      setMaxDeviation: aoeTemplateSetMaxDeviation,
      setToRulerP: aoeTemplateSetToRulerP,
      setTargetP: aoeTemplateSetTargetP,
      render: aoeTemplateRender
    });

    templateModel.registerTemplate('aoe', aoeTemplateModel);
    R.curryService(aoeTemplateModel);
    return aoeTemplateModel;

    function aoeTemplateCreate(temp) {
      return R.set(SIZE_LENS, 15, temp);
    }
    function aoeTemplateSetSizeP(size, temp) {
      return R.threadP(size)(function (size) {
        return R.find(R.equals(size), [3, 4, 5]);
      }, R.rejectIfP(R.isNil, 'Invalid size for an AoE'), function () {
        return R.set(SIZE_LENS, size * 5, temp);
      });
    }
    function aoeTemplateSize(temp) {
      return R.view(SIZE_LENS, temp);
    }
    function aoeTemplateDeviateP(dir, len, temp) {
      return R.threadP(temp)(R.rejectIfP(templateModel.isLocked, 'Template is locked'), function (temp) {
        dir = temp.state.r + 60 * (dir - 1);
        var max_len = R.viewOr(len, MAX_DEVIATION_LENS, temp);
        len = Math.min(len, max_len);
        return R.thread(temp)(R.over(R.lensProp('state'), pointModel.translateInDirection$(len * 10, dir)), R.assocPath(['state', 'r'], dir), templateModel.checkState);
      });
    }
    function aoeTemplateMaxDeviation(temp) {
      return R.viewOr(0, MAX_DEVIATION_LENS, temp);
    }
    function aoeTemplateSetMaxDeviation(max, temp) {
      return R.set(MAX_DEVIATION_LENS, max, temp);
    }
    function aoeTemplateSetToRulerP(pos, temp) {
      return R.threadP(temp)(R.rejectIfP(templateModel.isLocked, 'Template is locked'), function (temp) {
        var state = R.thread(temp.state)(R.assoc('x', pos.x), R.assoc('y', pos.y), R.assoc('r', pos.r), R.assoc('m', pos.m));
        return R.thread(temp)(R.assoc('state', state), templateModel.checkState);
      });
    }
    function aoeTemplateSetTargetP(_factions_, _origin_, target, temp) {
      return templateModel.setPositionP(target.state, temp);
    }
    function aoeTemplateRender(temp_state, base_render) {
      R.deepExtend(base_render, {
        x: temp_state.x,
        y: temp_state.y,
        radius: temp_state.s || 15,
        dx: temp_state.x,
        dy: temp_state.y - (temp_state.s || 15),
        dtransform: 'rotate(' + temp_state.r + ',' + temp_state.x + ',' + temp_state.y + ')'
      });
      return {
        text_center: { x: temp_state.x,
          y: temp_state.y + temp_state.s + 5
        },
        flip_center: temp_state,
        rotate_with_model: false
      };
    }
  }
})();
//# sourceMappingURL=aoe.js.map
