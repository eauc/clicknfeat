(function() {
  angular.module('clickApp.services')
    .factory('sprayTemplateMode', sprayTemplateModeModelFactory);

  sprayTemplateModeModelFactory.$inject = [
    'appState',
    'modes',
    'settings',
    'templateMode',
    'sprayTemplate',
    'gameTemplates',
    'gameTemplateSelection',
    'gameModels',
  ];
  function sprayTemplateModeModelFactory(appStateService,
                                         modesModel,
                                         settingsModel,
                                         templateModeModel,
                                         sprayTemplateModel,
                                         gameTemplatesModel,
                                         gameTemplateSelectionModel,
                                         gameModelsModel) {
    const template_actions = Object.create(templateModeModel.actions);
    template_actions.spraySize6 = spraySize6;
    template_actions.spraySize8 = spraySize8;
    template_actions.spraySize10 = spraySize10;
    template_actions.setOriginModel = setOriginModel;
    template_actions.setTargetModel = setTargetModel;
    const moves = [
      ['rotateLeft', 'left'],
      ['rotateRight', 'right'],
    ];
    const buildTemplateMove$ = R.curry(buildTemplateMove);
    R.forEach(([move]) => {
      template_actions[move] = buildTemplateMove$(move, false);
      template_actions[move+'Small'] = buildTemplateMove$(move, true);
    }, moves);

    const template_default_bindings = {
      setOriginModel: 'ctrl+clickModel',
      setTargetModel: 'shift+clickModel',
      spraySize6: '6',
      spraySize8: '8',
      spraySize10: '0'
    };
    const template_bindings = R.extend(Object.create(templateModeModel.bindings),
                                       template_default_bindings);

    const template_buttons = R.concat([
      [ 'Size'    , 'toggle'      , 'size' ],
      [ 'Spray6'  , 'spraySize6'  , 'size' ],
      [ 'Spray8'  , 'spraySize8'  , 'size' ],
      [ 'Spray10' , 'spraySize10' , 'size' ],
    ], templateModeModel.buttons);

    const template_mode = {
      onEnter: () => { },
      onLeave: () => { },
      name: 'spray'+templateModeModel.name,
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
    const findOriginModel$ = R.curry(findOriginModel);
    return template_mode;

    function spraySize6(state) {
      const stamps = gameTemplateSelectionModel
            .get('local', state.game.template_selection);
      return appStateService
        .onAction(state, [ 'Game.command.execute',
                           'onTemplates',
                           ['setSizeP', [6], stamps] ]);
    }
    function spraySize8(state) {
      const stamps = gameTemplateSelectionModel
            .get('local', state.game.template_selection);
      return appStateService
        .onAction(state, [ 'Game.command.execute',
                           'onTemplates',
                           ['setSizeP', [8], stamps] ]);
    }
    function spraySize10(state) {
      const stamps = gameTemplateSelectionModel
            .get('local', state.game.template_selection);
      return appStateService
        .onAction(state, [ 'Game.command.execute',
                           'onTemplates',
                           ['setSizeP', [10], stamps] ]);
    }
    function setOriginModel(state, event) {
      const stamps = gameTemplateSelectionModel
            .get('local', state.game.template_selection);
      return appStateService
        .onAction(state, [ 'Game.command.execute',
                           'onTemplates',
                           [ 'setOriginP',
                             [event['click#'].target],
                             stamps
                           ] ]);
    }
    function setTargetModel(state, event) {
      const stamps = gameTemplateSelectionModel
              .get('local', state.game.template_selection);
      R.thread(state.game)(
        R.prop('templates'),
        gameTemplatesModel.findStamp$(stamps[0]),
        R.unless(
          R.isNil,
          R.pipe(
            sprayTemplateModel.origin,
            findOriginModel$(state),
            (origin_model) => {
              if(R.isNil(origin_model)) return state;

              return appStateService
                .onAction(state, [ 'Game.command.execute',
                                   'onTemplates',
                                   [ 'setTargetP',
                                     [ origin_model,
                                       event['click#'].target],
                                     stamps
                                   ] ]);
            }
          )
        )
      );
    }
    function buildTemplateMove(move, small, state) {
      const stamps = gameTemplateSelectionModel
              .get('local', state.game.template_selection);
      return R.thread(state.game)(
        R.prop('templates'),
        gameTemplatesModel.findStamp$(stamps[0]),
        sprayTemplateModel.origin,
        findOriginModel$(state),
        (origin_model) => {
          return appStateService
            .onAction(state, [ 'Game.command.execute',
                               'onTemplates',
                               [ move+'P',
                                 [origin_model, small],
                                 stamps
                               ] ]);
        }
      );
    }
    function findOriginModel(state, stamp) {
      if(R.isNil(stamp)) return null;

      return gameModelsModel
        .findStamp(stamp, state.game.models);
    }
  }
})();
