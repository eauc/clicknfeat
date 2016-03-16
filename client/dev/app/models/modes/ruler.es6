(function() {
  angular.module('clickApp.services')
    .factory('rulerMode', rulerModeModelFactory);

  rulerModeModelFactory.$inject = [
    'segmentMode',
    'gameRuler',
    'prompt',
  ];
  function rulerModeModelFactory(segmentModeModel,
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
      return R.threadP()(
        () => state.eventP('Game.command.execute',
                           'setRuler', [
                             'setOrigin',
                             [event['click#'].target]
                           ]),
        () => updateMaxLengthButton(state)
      );
    }
    function rulerSetTargetModel(state, event) {
      return state.eventP('Game.command.execute',
                          'setRuler', [
                            'setTarget',
                            [event['click#'].target]
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
            () => state.eventP('Game.command.execute',
                               'setRuler', [
                                 'setMaxLength', [value]
                               ]),
          () => {
            const origin = gameRulerModel.origin(state.game.ruler);
            if(R.isNil(origin)) return null;

            return state.eventP('Game.command.execute',
                                'onModels', [
                                  'setRulerMaxLength',
                                  [value],
                                  [origin]
                                ]);
          }
        ),
        () => updateMaxLengthButton(state)
      );
    }
    function rulerCreateAoEOnTarget(state) {
      return R.threadP(state.game.ruler)(
        gameRulerModel
          .targetAoEPositionP$(state.game.models),
        (position) => ({
          base: { x: 0, y: 0, r: 0 },
          templates: [ R.assoc('type', 'aoe', position) ]
        }),
        (create) => state.eventP('Game.command.execute',
                                 'createTemplate', [
                                   create, false
                                 ])
      );
    }
    function rulerOnEnter(state) {
      return R.threadP()(
        () => baseOnEnter(state),
        () => updateMaxLengthButton(state)
      );
    }
    function updateMaxLengthButton(state) {
      const max = gameRulerModel.maxLength(state.game.ruler);
      ruler_mode.buttons[0][0] = `Set Max Len. (${max})`;
      state.queueChangeEventP('Modes.buttons.update');
    }
  }
})();
