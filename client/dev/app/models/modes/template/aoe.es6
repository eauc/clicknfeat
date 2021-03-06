(function() {
  angular.module('clickApp.services')
    .factory('aoeTemplateMode', aoeTemplateModeModelFactory);

  aoeTemplateModeModelFactory.$inject = [
    'appAction',
    'appState',
    'modes',
    'settings',
    'templateMode',
    'gameTemplates',
    'gameTemplateSelection',
    'gameRuler',
    'prompt',
  ];
  function aoeTemplateModeModelFactory(appActionService,
                                       appStateService,
                                       modesModel,
                                       settingsModel,
                                       templateModeModel,
                                       gameTemplatesModel,
                                       gameTemplateSelectionModel,
                                       gameRulerModel,
                                       promptService) {
    const RULER_LENS = R.lensPath(['game', 'ruler']);
    const template_actions = Object.create(templateModeModel.actions);
    template_actions.aoeSize3 = aoeSize3;
    template_actions.aoeSize4 = aoeSize4;
    template_actions.aoeSize5 = aoeSize5;
    template_actions.setTargetModel = setTargetModel;
    template_actions.setMaxDeviation = setMaxDeviation;
    template_actions.deviate = deviate;
    template_actions.setToRulerTarget = setToRulerTarget;

    const template_default_bindings = {
      setTargetModel: 'shift+clickModel',
      aoeSize3: '3',
      aoeSize4: '4',
      aoeSize5: '5',
      deviate: 'd',
      setMaxDeviation: 'shift+d',
      setToRulerTarget: 'shift+r'
    };
    const template_bindings = R.extend(Object.create(templateModeModel.bindings),
                                       template_default_bindings);
    const template_buttons = R.concat([
      [ 'Size'         , 'toggle'           , 'size' ],
      [ 'Aoe3'         , 'aoeSize3'         , 'size' ],
      [ 'Aoe4'         , 'aoeSize4'         , 'size' ],
      [ 'Aoe5'         , 'aoeSize5'         , 'size' ],
      [ 'Deviate'      , 'deviate'          ],
      [ 'Set Max Dev.' , 'setMaxDeviation'  ],
      [ 'Set to Ruler' , 'setToRulerTarget' ],
    ], templateModeModel.buttons);

    const template_mode = {
      onEnter: () => {},
      onLeave: () => {},
      name: 'aoe'+templateModeModel.name,
      actions: template_actions,
      buttons: template_buttons,
      bindings: template_bindings
    };
    modesModel.registerMode(template_mode);
    settingsModel.register('Bindings',
                           template_mode.name,
                           template_default_bindings,
                           (bs) => {
                             R.extend(template_mode.bindings, bs);
                           });
    return template_mode;

    function aoeSize3(state) {
      const stamps = gameTemplateSelectionModel
            .get('local', state.game.template_selection);
      return appStateService
        .onAction(state, [ 'Game.command.execute',
                           'onTemplates',
                           ['setSizeP', [3], stamps] ]);
    }
    function aoeSize4(state) {
      const stamps = gameTemplateSelectionModel
            .get('local', state.game.template_selection);
      return appStateService
        .onAction(state, [ 'Game.command.execute',
                           'onTemplates',
                           ['setSizeP', [4], stamps] ]);
    }
    function aoeSize5(state) {
      const stamps = gameTemplateSelectionModel
            .get('local', state.game.template_selection);
      return appStateService
        .onAction(state, [ 'Game.command.execute',
                           'onTemplates',
                           ['setSizeP', [5], stamps] ]);
    }
    function setTargetModel(state, event) {
      const stamps = gameTemplateSelectionModel
            .get('local', state.game.template_selection);
      return appStateService
        .onAction(state, [ 'Game.command.execute',
                           'onTemplates',
                           [ 'setTargetP',
                             [event['click#'].target],
                             stamps
                           ] ]);
    }
    function setMaxDeviation(state) {
      const stamps = gameTemplateSelectionModel
            .get('local', state.game.template_selection);
      return R.threadP(state.game)(
        R.prop('templates'),
        gameTemplatesModel.fromStampsP$('maxDeviation', [], stamps),
        askForMaxP,
        (value) => ((value === 0) ? null : value),
        R.defaultTo(null),
        (max) => appActionService
          .do('Game.templates.setDeviationMax', stamps, max)
      );

      function askForMaxP(maxes) {
        const max = maxes[0];
        return promptService
          .promptP('prompt', 'Set AoE max deviation :', max)
          .catch(() => null);
      }
    }
    function deviate(state) {
      const stamps = gameTemplateSelectionModel
            .get('local', state.game.template_selection);
      return appStateService
        .onAction(state, [ 'Game.command.execute',
                           'rollDeviation', [stamps] ]);
    }
    function setToRulerTarget(state) {
      const stamps = gameTemplateSelectionModel
            .get('local', state.game.template_selection);
      return R.thread(state)(
        R.view(RULER_LENS),
        R.ifElse(
          gameRulerModel.isDisplayed,
          R.pipe(
            gameRulerModel.targetAoEPosition$(state.game.models),
            (position) => appStateService
              .onAction(state, [ 'Game.command.execute',
                                 'onTemplates',
                                 [ 'setToRulerP',
                                   [position],
                                   stamps
                                 ]
                               ])
          ),
          () => state
        )
      );
    }
  }
})();
