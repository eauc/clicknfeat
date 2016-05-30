(function() {
  angular.module('clickApp.services')
    .factory('modelChargeMode', modelChargeModeModelFactory);

  modelChargeModeModelFactory.$inject = [
    'appAction',
    'appState',
    'modes',
    'settings',
    'modelsMode',
    'modelBaseMode',
    'model',
    'gameModels',
    'gameModelSelection',
  ];
  function modelChargeModeModelFactory(appActionService,
                                       appStateService,
                                       modesModel,
                                       settingsModel,
                                       modelsModeModel,
                                       modelBaseModeModel,
                                       modelModel,
                                       gameModelsModel,
                                       gameModelSelectionModel) {
    const charge_actions = Object.create(modelBaseModeModel.actions);
    charge_actions.endCharge = chargeModelEnd;
    charge_actions.setTargetModel = chargeModelSetTarget;
    const moves = [
      ['moveFront'   , 'up'         , 'moveFront'   ],
      ['moveBack'    , 'down'       , 'moveBack'    ],
      ['rotateLeft'  , 'left'       , 'rotateLeft'  ],
      ['rotateRight' , 'right'      , 'rotateRight' ],
      ['shiftUp'     , 'ctrl+up'    , 'shiftDown'   ],
      ['shiftDown'   , 'ctrl+down'  , 'shiftUp'     ],
      ['shiftLeft'   , 'ctrl+left'  , 'shiftRight'  ],
      ['shiftRight'  , 'ctrl+right' , 'shiftLeft'   ],
    ];
    const chargeModelMove$ = R.curry(chargeModelMove);
    R.forEach(buildChargeMove, moves);

    const charge_default_bindings = {
      'endCharge': 'c',
      'setTargetModel': 'shift+clickModel'
    };
    const charge_bindings = R.extend(Object.create(modelBaseModeModel.bindings),
                                     charge_default_bindings);
    const charge_buttons = modelsModeModel
            .buildButtons({ single: true,
                            end_charge: true
                          });
    const charge_mode = {
      onEnter: () => { },
      onLeave: () => { },
      name: 'ModelCharge',
      actions: charge_actions,
      buttons: charge_buttons,
      bindings: charge_bindings
    };
    modesModel.registerMode(charge_mode);
    settingsModel.register('Bindings',
                           charge_mode.name,
                           charge_default_bindings,
                           (bs) => {
                             R.extend(charge_mode.bindings, bs);
                           });
    return charge_mode;

    function chargeModelEnd(state) {
      const stamps = gameModelSelectionModel
            .get('local', state.game.model_selection);
      appActionService
        .defer('Game.command.execute',
               'onModels',
               ['endCharge', [], stamps]);
      return appStateService
        .onAction(state, [ 'Modes.switchTo','Model' ]);
    }
    function chargeModelSetTarget(state, event) {
      const stamps = gameModelSelectionModel
              .get('local', state.game.model_selection);
      return R.thread(state.game)(
        R.prop('models'),
        gameModelsModel.findStamp$(stamps[0]),
        R.unless(
          R.isNil,
          R.pipe(
            (model) => R.thread(model)(
              modelModel.chargeTarget,
              (target_stamp) => ( target_stamp === event['click#'].target.state.stamp
                                  ? null
                                  : event['click#'].target
                                ),
              (set_target) => {
                if(R.exists(set_target) &&
                   model.state.stamp === set_target.state.stamp) return state;

                return appStateService
                  .onAction(state, [ 'Game.command.execute',
                                     'onModels', [
                                       'setChargeTargetP',
                                       [set_target],
                                       stamps
                                     ] ]);
              }
            )
          )
        )
      );
    }
    function chargeModelMove(move, flip_move, small, state) {
      const stamps = gameModelSelectionModel
              .get('local', state.game.model_selection);
      const _move = ( R.path(['view','flip_map'], state)
                      ? flip_move
                      : move
                    );
      return R.thread(state.game)(
        R.prop('models'),
        gameModelsModel.findStamp$(stamps[0]),
        R.unless(
          R.isNil,
          R.pipe(
            modelModel.chargeTarget,
            (target_stamp) => ( R.exists(target_stamp)
                                ? gameModelsModel.findStamp(target_stamp,
                                                            state.game.models)
                                : null
                              ),
            (target_model) => appStateService
              .onAction(state, [ 'Game.command.execute',
                                 'onModels', [
                                   `${_move}ChargeP`,
                                   [target_model, small],
                                   stamps
                                 ] ])
          )
        )
      );
    }
    function buildChargeMove([move, _keys_, flip_move]) {
      charge_actions[move] = chargeModelMove$(move, flip_move, false);
      charge_actions[move+'Small'] = chargeModelMove$(move, flip_move, true);
    }
  }
})();
