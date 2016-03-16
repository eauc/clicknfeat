(function() {
  angular.module('clickApp.services')
    .factory('modelPlaceMode', modelPlaceModeModelFactory);

  modelPlaceModeModelFactory.$inject = [
    'modes',
    'settings',
    'modelsMode',
    'modelBaseMode',
    'gameModels',
    'gameModelSelection',
  ];
  function modelPlaceModeModelFactory(modesModel,
                                      settingsModel,
                                      modelsModeModel,
                                      modelBaseModeModel,
                                      gameModelsModel,
                                      gameModelSelectionModel) {
    const model_actions = Object.create(modelBaseModeModel.actions);
    model_actions.endPlace = placeModelEnd;
    model_actions.setTargetModel = placeModelSetTarget;
    model_actions.setOriginModel = placeModelSetOrigin;

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
    const placeModelMove$ = R.curry(placeModelMove);
    R.forEach(buildPlaceMove, moves);

    const model_default_bindings = {
      'endPlace': 'p',
      'setTargetModel': 'shift+clickModel',
      'setOriginModel': 'ctrl+clickModel'
    };
    const model_bindings = R.extend(Object.create(modelBaseModeModel.bindings),
                                    model_default_bindings);
    const model_buttons = modelsModeModel
            .buildButtons({ single: true,
                            end_place: true
                          });
    const model_mode = {
      onEnter: () => { },
      onLeave: () => { },
      name: 'ModelPlace',
      actions: model_actions,
      buttons: model_buttons,
      bindings: model_bindings
    };
    modesModel.registerMode(model_mode);
    settingsModel.register('Bindings',
                           model_mode.name,
                           model_default_bindings,
                           (bs) => {
                             R.extend(model_mode.bindings, bs);
                           });
    return model_mode;

    function placeModelEnd(state) {
      const stamps = gameModelSelectionModel
              .get('local', state.game.model_selection);
      return R.threadP()(
        () => state.eventP('Game.command.execute',
                           'onModels', [
                             'endPlace',
                             [],
                             stamps
                           ]),
        () => state.eventP('Modes.switchTo', 'Model')
      );
    }
    function placeModelSetTarget(state, event) {
      const stamps = gameModelSelectionModel
            .get('local', state.game.model_selection);
      return R.threadP(state.game)(
        R.prop('models'),
        gameModelsModel.findStampP$(stamps[0]),
        (model) => {
          if(model.state.stamp === event['click#'].target.state.stamp) return null;

          return state.eventP('Game.command.execute',
                              'onModels', [
                                'setPlaceTargetP',
                                [state.factions, event['click#'].target],
                                stamps
                              ]);
        }
      );
    }
    function placeModelSetOrigin(state, event) {
      const stamps = gameModelSelectionModel
              .get('local', state.game.model_selection);
      return R.threadP(state.game)(
        R.prop('models'),
        gameModelsModel.findStampP$(stamps[0]),
        (model) => {
          if(model.state.stamp === event['click#'].target.state.stamp) return null;

          return state.eventP('Game.command.execute',
                              'onModels', [
                                'setPlaceOriginP',
                                [state.factions, event['click#'].target],
                                stamps
                              ]);
        }
      );
    }
    function placeModelMove(move, flip_move, small, state) {
      const stamps = gameModelSelectionModel
              .get('local', state.game.model_selection);
      const _move = ( R.path(['ui_state','flip_map'], state)
                      ? flip_move
                      : move
                    );
      return state.eventP('Game.command.execute',
                          'onModels', [
                            _move+'PlaceP',
                            [state.factions, small],
                            stamps
                          ]);
    }
    function buildPlaceMove([move, _keys_, flip_move]) {
      model_actions[move] = placeModelMove$(move, flip_move, false);
      model_actions[move+'Small'] = placeModelMove$(move, flip_move, true);
    }
  }
})();
