(function() {
  angular.module('clickApp.services')
    .factory('rulerMode', rulerModeModelFactory);

  rulerModeModelFactory.$inject = [
    'appState',
    'segmentMode',
    'gameRuler',
    'prompt',
  ];
  function rulerModeModelFactory(appStateService,
                                 segmentModeModel,
                                 gameRulerModel,
                                 promptModel) {
    const ruler_default_bindings = {
      exitRulerMode: 'ctrl+r',
      setMaxLength: 'shift+r',
      setOriginModel: 'ctrl+clickModel',
      setTargetModel: 'shift+clickModel',
      createAoEOnTarget: 'ctrl+a'
    };

    const ruler_mode =
            segmentModeModel('ruler', gameRulerModel, ruler_default_bindings);
    ruler_mode.actions.setOriginModel = rulerSetOriginModel;
    ruler_mode.actions.setTargetModel = rulerSetTargetModel;
    ruler_mode.actions.setMaxLength = rulerSetMaxLength;
    ruler_mode.actions.createAoEOnTarget = rulerCreateAoEOnTarget;

    ruler_mode.buttons = R.concat(ruler_mode.buttons, [
      [ 'Set Max Len.', 'setMaxLength' ],
      [ 'AoE on Target', 'createAoEOnTarget' ],
    ]);
    const baseOnEnter = ruler_mode.onEnter;
    ruler_mode.onEnter = rulerOnEnter;

    return ruler_mode;

    function rulerSetOriginModel(state, event) {
      appStateService
        .chainReduce('Game.command.execute',
                     'setRuler', [
                       'setOrigin',
                       [event['click#'].target, state]
                     ]);
    }
    function rulerSetTargetModel(state, event) {
      appStateService
        .chainReduce('Game.command.execute',
                     'setRuler', [
                       'setTarget',
                       [event['click#'].target, state]
                     ]);
    }
    function rulerSetMaxLength(state) {
      return R.threadP()(
        () => promptModel
          .promptP('prompt', 'Set ruler max length :',
                   gameRulerModel.maxLength(state.game.ruler))
          .catch(R.always(null)),
        (value) => (value === 0) ? null : value,
        (value) => R.threadP()(
          () => {
            appStateService
              .chainReduce('Game.command.execute',
                           'setRuler', [
                             'setMaxLength', [value, state]
                           ]);
          },
          () => {
            const origin = gameRulerModel.origin(state.game.ruler);
            if(R.isNil(origin)) return;

            appStateService
              .chainReduce('Game.command.execute',
                           'onModels', [
                             'setRulerMaxLength',
                             [value],
                             [origin]
                           ]);
          }
        )
      );
    }
    function rulerCreateAoEOnTarget(state) {
      R.thread(state.game.ruler)(
        gameRulerModel.targetAoEPosition$(state.game.models),
        (position) => ({
          base: { x: 0, y: 0, r: 0 },
          templates: [ R.assoc('type', 'aoe', position) ]
        }),
        (create) => {
          appStateService
            .chainReduce('Game.command.execute',
                         'createTemplate', [
                           create, false
                         ]);
        }
      );
    }
    function rulerOnEnter() {
      const state = appStateService.current();
      return R.threadP()(
        () => baseOnEnter(state),
        () => updateMaxLengthButton(state)
      );
    }
    function updateMaxLengthButton(state) {
      const max = gameRulerModel.maxLength(state.game.ruler);
      ruler_mode.buttons[0][0] = `Set Max Len. (${max})`;
      appStateService.emit('Modes.buttons.update');
    }
  }
})();
