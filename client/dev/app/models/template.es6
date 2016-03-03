(function() {
  angular.module('clickApp.services')
    .factory('template', templateModelFactory)
    .factory('allTemplates', [
      'aoeTemplate',
      'sprayTemplate',
      'wallTemplate',
      () => ({})
    ]);

  templateModelFactory.$inject = [
    'settings',
    'element',
  ];
  function templateModelFactory(settingsModel,
                                elementModel) {
    const TEMPS_REG = {};
    const DEFAULT_MOVES = {
      Move: 10,
      MoveSmall: 1,
      Rotate: 60,
      RotateSmall: 6,
      Shift: 10,
      ShiftSmall: 1
    };
    const MOVES = R.clone(DEFAULT_MOVES);
    settingsModel.register('Moves',
                           'Template',
                           DEFAULT_MOVES,
                           (moves) => {
                             R.extend(MOVES, moves);
                           });

    const base = elementModel('template', MOVES);
    const templateModel = Object.create(base);
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
      return R.threadP(TEMPS_REG)(
        R.prop(temp.type),
        R.rejectIf(R.isNil, `Create unknown template type "${temp.type}"`),
        (model) => R.threadP(base.createDefaultP())(
          R.assocPath(['state','type'], temp.type),
          model._create
        )
      );
    }
    function templateRespondTo(method, template) {
      return ( R.exists(TEMPS_REG[template.state.type]) &&
               R.exists(TEMPS_REG[template.state.type][method])
             );
    }
    function templateCallP(method, args, template) {
      return R.threadP(template)(
        R.rejectIf(R.complement(templateModel.respondTo$(method)),
                   `Unknown call ${method} on ${template.state.type} template`),
        () => TEMPS_REG[template.state.type][method]
          .apply(TEMPS_REG[template.state.type],
                 [...args, template])
      );
    }
  }
})();
