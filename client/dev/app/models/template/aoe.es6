(function() {
  angular.module('clickApp.models')
    .factory('aoeTemplate', aoeTemplateModelFactory);

  aoeTemplateModelFactory.$inject = [
    'template',
    'point',
  ];
  function aoeTemplateModelFactory(templateModel,
                                   pointModel) {
    const aoeTemplateModel = Object.create(templateModel);
    R.deepExtend(aoeTemplateModel, {
      _create: aoeTemplateCreate,
      setSizeP: aoeTemplateSetSizeP,
      size: aoeTemplateSize,
      deviate: aoeTemplateDeviateP,
      maxDeviation: aoeTemplateMaxDeviation,
      setMaxDeviation: aoeTemplateSetMaxDeviation,
      setToRulerP: aoeTemplateSetToRulerP,
      setTargetP: aoeTemplateSetTargetP
    });

    templateModel.registerTemplate('aoe', aoeTemplateModel);
    R.curryService(aoeTemplateModel);
    return aoeTemplateModel;

    function aoeTemplateCreate(temp) {
      return R.assocPath(['state','s'], 15, temp);
    }
    function aoeTemplateSetSizeP(size, temp) {
      return R.threadP(size)(
        (size) => R.find(R.equals(size), [3,4,5]),
        R.rejectIfP(R.isNil, 'Invalid size for an AoE'),
        () => R.assocPath(['state','s'], size * 5, temp)
      );
    }
    function aoeTemplateSize(temp) {
      return R.path(['state','s'], temp);
    }
    function aoeTemplateDeviateP(dir, len, temp) {
      return R.threadP(temp)(
        R.rejectIfP(templateModel.isLocked, 'Template is locked'),
        (temp) => {
          dir = temp.state.r + 60 * (dir-1);
          const max_len = R.defaultTo(len, R.path(['state','m'], temp));
          len = Math.min(len, max_len);
          return R.thread(temp)(
            R.over(R.lensProp('state'),
                   pointModel.translateInDirection$(len * 10, dir)),
            R.assocPath(['state','r'], dir),
            templateModel.checkState
          );
        }
      );
    }
    function aoeTemplateMaxDeviation(temp) {
      return R.pathOr(0, ['state','m'], temp);
    }
    function aoeTemplateSetMaxDeviation(max, temp) {
      return R.assocPath(['state','m'], max, temp);
    }
    function aoeTemplateSetToRulerP(pos, temp) {
      return R.threadP(temp)(
        R.rejectIfP(templateModel.isLocked, 'Template is locked'),
        (temp) => {
          const state = R.thread(temp.state)(
            R.assoc('x', pos.x),
            R.assoc('y', pos.y),
            R.assoc('r', pos.r),
            R.assoc('m', pos.m)
          );
          return R.thread(temp)(
            R.assoc('state', state),
            templateModel.checkState
          );
        }
      );
    }
    function aoeTemplateSetTargetP(_factions_, _origin_, target, temp) {
      return templateModel.setPositionP(target.state, temp);
    }
  }
})();
