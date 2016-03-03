'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function () {
  angular.module('clickApp.services').factory('template', templateModelFactory).factory('allTemplates', ['aoeTemplate', 'sprayTemplate', 'wallTemplate', function () {
    return {};
  }]);

  templateModelFactory.$inject = ['settings', 'element'];
  function templateModelFactory(settingsModel, elementModel) {
    var TEMPS_REG = {};
    var DEFAULT_MOVES = {
      Move: 10,
      MoveSmall: 1,
      Rotate: 60,
      RotateSmall: 6,
      Shift: 10,
      ShiftSmall: 1
    };
    var MOVES = R.clone(DEFAULT_MOVES);
    settingsModel.register('Moves', 'Template', DEFAULT_MOVES, function (moves) {
      R.extend(MOVES, moves);
    });

    var base = elementModel('template', MOVES);
    var templateModel = Object.create(base);
    R.deepExtend(templateModel, {
      createDefaultP: templateCreateDefaultP,
      registerTemplate: templateRegister,
      respondTo: templateRespondTo,
      callP: templateCallP
    });

    R.curryService(templateModel);
    return templateModel;

    function templateRegister(type, model) {
      TEMPS_REG[type] = model;
    }
    function templateCreateDefaultP(temp) {
      return R.threadP(TEMPS_REG)(R.prop(temp.type), R.rejectIf(R.isNil, 'Create unknown template type "' + temp.type + '"'), function (model) {
        return R.threadP(base.createDefaultP())(R.assocPath(['state', 'type'], temp.type), model._create);
      });
    }
    function templateRespondTo(method, template) {
      return R.exists(TEMPS_REG[template.state.type]) && R.exists(TEMPS_REG[template.state.type][method]);
    }
    function templateCallP(method, args, template) {
      return R.threadP(template)(R.rejectIf(R.complement(templateModel.respondTo$(method)), 'Unknown call ' + method + ' on ' + template.state.type + ' template'), function () {
        return TEMPS_REG[template.state.type][method].apply(TEMPS_REG[template.state.type], [].concat(_toConsumableArray(args), [template]));
      });
    }
  }
})();
//# sourceMappingURL=template.js.map
