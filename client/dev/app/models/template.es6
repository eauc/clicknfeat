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
    settingsModel.register('Misc',
                           'Template',
                           DEFAULT_MOVES,
                           (moves) => {
                             R.extend(MOVES, moves);
                           });

    const base = elementModel('template', MOVES);
    const templateModel = Object.create(base);
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
      return R.thread(temp.type)(
        R.unless(
          (type) => R.exists(TEMPS_REG[type]),
          () => null
        ),
        R.ifElse(
          R.exists,
          (type) => R.thread(base.createDefault())(
            R.assocPath(['state','type'], type),
            TEMPS_REG[type]._create
          ),
          () => base.createDefault()
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
        R.rejectIfP(R.complement(templateModel.respondTo$(method)),
                   `Unknown call ${method} on ${template.state.type} template`),
        () => TEMPS_REG[template.state.type][method]
          .apply(TEMPS_REG[template.state.type],
                 [...args, template])
      );
    }
    function templateRender(is_flipped, temp_state) {
      const render = {
        stamp: temp_state.stamp,
        type: temp_state.type,
        x: 0,
        y: 0,
        transform: ''
      };
      const label_options = TEMPS_REG[temp_state.type]
              .render(temp_state, render);
      label_options.flipped = is_flipped;
      render.label = base
        .renderLabel(label_options, temp_state);
      return render;
    }
  }
})();
