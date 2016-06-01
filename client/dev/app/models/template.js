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
    settingsModel.register('Misc', 'Template', DEFAULT_MOVES, function (moves) {
      R.extend(MOVES, moves);
    });

    var base = elementModel('template', MOVES);
    var templateModel = Object.create(base);
    R.deepExtend(templateModel, {
      registerTemplate: templateRegister,
      createDefault: templateCreateDefault,
      respondTo: templateRespondTo,
      callP: templateCallP,
      render: templateRender
    });

    R.curryService(templateModel);
    return templateModel;

    function templateRegister(type, model) {
      TEMPS_REG[type] = model;
    }
    function templateCreateDefault(temp) {
      return R.thread(temp.type)(R.unless(function (type) {
        return R.exists(TEMPS_REG[type]);
      }, function () {
        return null;
      }), R.ifElse(R.exists, function (type) {
        return R.thread(base.createDefault())(R.assocPath(['state', 'type'], type), TEMPS_REG[type]._create);
      }, function () {
        return base.createDefault();
      }));
    }
    function templateRespondTo(method, template) {
      return R.exists(TEMPS_REG[template.state.type]) && R.exists(TEMPS_REG[template.state.type][method]);
    }
    function templateCallP(method, args, template) {
      return R.threadP(template)(R.rejectIfP(R.complement(templateModel.respondTo$(method)), 'Unknown call ' + method + ' on ' + template.state.type + ' template'), function () {
        return TEMPS_REG[template.state.type][method].apply(TEMPS_REG[template.state.type], [].concat(_toConsumableArray(args), [template]));
      });
    }
    function templateRender(_ref, temp) {
      var is_flipped = _ref.is_flipped;

      var render = {
        stamp: temp.state.stamp,
        type: temp.state.type,
        x: 0,
        y: 0,
        transform: ''
      };
      var label_options = TEMPS_REG[temp.state.type].render(temp, render);
      label_options.flipped = is_flipped;
      render.label = base.renderLabel(label_options, temp);
      return render;
    }
  }
})();
//# sourceMappingURL=template.js.map
