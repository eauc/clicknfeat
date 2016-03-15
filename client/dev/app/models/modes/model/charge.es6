(function() {
  angular.module('clickApp.services')
    .factory('modelChargeMode', modelChargeModeModelFactory);

  modelChargeModeModelFactory.$inject = [
    'modes',
    'settings',
    'modelsMode',
    'modelBaseMode',
    'model',
    'game',
    'gameModels',
    'gameModelSelection',
  ];
  function modelChargeModeModelFactory(modesModel,
                                       settingsModel,
                                       modelsModeModel,
                                       modelBaseModeModel,
                                       modelModel,
                                       gameModel,
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
      return R.threadP()(
        () => state.eventP('Game.command.execute',
                           'onModels',
                           ['endCharge', [], stamps]),
        () => state.eventP('Modes.switchTo', 'Model')
      );
    }
    function chargeModelSetTarget(state, event) {
      const stamps = gameModelSelectionModel
              .get('local', state.game.model_selection);
      return R.threadP(state.game)(
        R.prop('models'),
        gameModelsModel.findStampP$(stamps[0]),
        (model) => R.threadP()(
          () => modelModel
            .chargeTargetP(model)
            .catch(R.always(null)),
          (target_stamp) => {
            return ( target_stamp === event['click#'].target.state.stamp
                     ? null
                     : event['click#'].target
                   );
          },
          (set_target) => {
            if(R.exists(set_target) &&
               model.state.stamp === set_target.state.stamp) return null;

            return state.eventP('Game.command.execute',
                                'onModels', [
                                  'setChargeTargetP',
                                  [state.factions, set_target],
                                  stamps
                                ]);
          }
        )
      );
    }
    function chargeModelMove(move, flip_move, small, state) {
      const stamps = gameModelSelectionModel
              .get('local', state.game.model_selection);
      const _move = ( R.path(['ui_state','flip_map'], state)
                      ? flip_move
                      : move
                    );
      return R.threadP(state.game)(
        R.prop('models'),
        gameModelsModel.findStampP$(stamps[0]),
        (model) => modelModel
          .chargeTargetP(model)
          .catch(R.always(null)),
        (target_stamp) => ( R.exists(target_stamp)
                            ? gameModelsModel.findStampP(target_stamp,
                                                         state.game.models)
                            : null
                          ),
        (target_model) => state
          .eventP('Game.command.execute',
                  'onModels', [
                    _move+'ChargeP',
                    [state.factions, target_model, small],
                    stamps
                  ])
      );
    }
    function buildChargeMove([move, keys, flip_move]) {
      charge_actions[move] = chargeModelMove$(move, flip_move, false);
      charge_actions[move+'Small'] = chargeModelMove$(move, flip_move, true);
    }
  }
})();
