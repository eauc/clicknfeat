(function() {
  angular.module('clickApp.services')
    .factory('modelsMode', modelsModeModelFactory);

  modelsModeModelFactory.$inject = [
    'appState',
    'modes',
    'settings',
    'defaultMode',
    'model',
    'gameModels',
    'gameModelSelection',
    'prompt',
  ];
  function modelsModeModelFactory(appStateService,
                                  modesModel,
                                  settingsModel,
                                  defaultModeModel,
                                  modelModel,
                                  gameModelsModel,
                                  gameModelSelectionModel,
                                  promptService) {
    const models_actions = Object.create(defaultModeModel.actions);
    models_actions.clickMap = modelsClearSelection;
    models_actions.rightClickMap = modelsClearSelection;
    models_actions.modeBackToDefault = modelsClearSelection;
    models_actions.deleteSelection = modelsDeleteSelection;
    models_actions.copySelection = modelsCopySelection;
    models_actions.toggleLock = modelsToggleLock;
    models_actions.toggleImageDisplay = modelsToggleImageDisplay;
    models_actions.setNextImage = modelsSetNextImage;
    models_actions.toggleWreckDisplay = modelsToggleWreckDisplay;
    models_actions.toggleUnitDisplay = modelsToggleUnitDisplay;
    models_actions.setUnit = modelsSetUnit;
    models_actions.toggleMeleeDisplay = modelsToggleMeleeDisplay;
    models_actions.toggleReachDisplay = modelsToggleReachDisplay;
    models_actions.toggleStrikeDisplay = modelsToggleStrikeDisplay;
    models_actions.toggleCounterDisplay = modelsToggleCounterDisplay;
    models_actions.incrementCounter = modelsIncrementCounter;
    models_actions.decrementCounter = modelsDecrementCounter;
    models_actions.toggleSoulsDisplay = modelsToggleSoulsDisplay;
    models_actions.incrementSouls = modelsIncrementSouls;
    models_actions.decrementSouls = modelsDecrementSouls;
    // models_actions.setRulerMaxLength = modelsSetRulerMaxLength;
    models_actions.setChargeMaxLength = modelsSetChargeMaxLength;
    // models_actions.setPlaceMaxLength = modelsSetPlaceMaxLength;
    // models_actions.togglePlaceWithin = modelsTogglePlaceWithin;
    models_actions.toggleLeaderDisplay = modelsToggleLeaderDisplay;
    models_actions.toggleIncorporealDisplay = modelsToggleIncorporealDisplay;
    models_actions.setOrientationUp = modelsSetOrientationUp;
    models_actions.setOrientationDown = modelsSetOrientationDown;
    models_actions.setTargetModel = modelsSetTargetModel;
    models_actions.clearLabel = modelsClearLabel;
    const effects = [
      [ 'Blind'      , 'b' ],
      [ 'Corrosion'  , 'c' ],
      [ 'Disrupt'    , 'd' ],
      [ 'Fire'       , 'f' ],
      [ 'Fleeing'    , 'e' ],
      [ 'KD'         , 'k' ],
      [ 'Stationary' , 't' ],
    ];
    R.forEach(modelsToggleEffect, effects);
    const auras = [
      [ 'Red'    , '#F00' ],
      [ 'Green'  , '#0F0' ],
      [ 'Blue'   , '#00F' ],
      [ 'Yellow' , '#FF0' ],
      [ 'Purple' , '#F0F' ],
      [ 'Cyan'   , '#0FF' ],
    ];
    R.forEach(modelsToggleAura, auras);
    models_actions.toggleCtrlAreaDisplay = modelsToggleCtrlAreaDisplay;
    const areas = R.range(0, 10);
    R.forEach(modelsToggleAreaDisplay, areas);
    const moves = [
      ['moveFront'   , 'up'    ],
      ['moveBack'    , 'down'  ],
      ['rotateLeft'  , 'left'  ],
      ['rotateRight' , 'right' ],
    ];
    R.forEach(modelsMove, moves);
    const shifts = [
      ['shiftUp'    , 'ctrl+up'    , 'shiftDown'  ],
      ['shiftDown'  , 'ctrl+down'  , 'shiftUp'    ],
      ['shiftLeft'  , 'ctrl+left'  , 'shiftRight' ],
      ['shiftRight' , 'ctrl+right' , 'shiftLeft'  ],
    ];
    R.forEach(modelsShift, shifts);
    modelsDrag();

    const models_default_bindings = {
      'clickMap': 'clickMap',
      'rightClickMap': 'rightClickMap',
      'deleteSelection': 'del',
      'copySelection': 'ctrl+c',
      'toggleLock': 'l',
      'toggleImageDisplay': 'alt+i',
      'setNextImage': 'shift+i',
      'toggleWreckDisplay': 'alt+w',
      'setOrientationUp': 'pageup',
      'setOrientationDown': 'pagedown',
      'setTargetModel': 'shift+clickModel',
      'toggleCounterDisplay': 'alt+n',
      'incrementCounter': '+',
      'decrementCounter': '-',
      'toggleSoulsDisplay': 'alt+o',
      'incrementSouls': 'ctrl++',
      'decrementSouls': 'ctrl+-',
      'toggleCtrlAreaDisplay': 'alt+a',
      'setRulerMaxLength': 'shift+r',
      'setChargeMaxLength': 'shift+c',
      'setPlaceMaxLength': 'shift+p',
      'togglePlaceWithin': 'alt+p',
      'toggleMeleeDisplay': 'alt+m',
      'toggleReachDisplay': 'alt+r',
      'toggleStrikeDisplay': 'alt+s',
      'toggleUnitDisplay': 'alt+u',
      'setUnit': 'shift+u',
      'toggleLeaderDisplay': 'alt+l',
      'toggleIncorporealDisplay': 'alt+g',
      'clearLabel': 'ctrl+shift+l'
    };
    R.forEach(modelsBindMove, moves);
    R.forEach(modelsBindShift, shifts);
    R.forEach(modelsBindArea, areas);
    R.addIndex(R.forEach)(modelsBindAura, auras);
    R.forEach(modelsBindEffect, effects);
    const models_bindings = R.extend(Object.create(defaultModeModel.bindings),
                                     models_default_bindings);

    const models_buttons = buildModelsModesButtons();
    const models_mode = {
      onEnter: () => { },
      onLeave: () => { },
      name: 'Models',
      actions: models_actions,
      buttons: models_buttons,
      buildButtons: buildModelsModesButtons,
      bindings: models_bindings,
      areas: areas,
      auras: auras,
      effects: effects
    };
    modesModel.registerMode(models_mode);
    settingsModel.register('Bindings',
                           models_mode.name,
                           models_default_bindings,
                           (bs) => {
                             R.extend(models_mode.bindings, bs);
                           });

    return models_mode;

    function modelsClearSelection() {
      appStateService
        .chainReduce('Game.command.execute',
                     'setModelSelection',
                     [ 'clear', null ]);
    }
    function modelsDeleteSelection(state) {
      const stamps = gameModelSelectionModel
              .get('local', state.game.model_selection);
      appStateService
        .chainReduce('Game.command.execute',
                     'deleteModel', [stamps]);
    }
    function modelsCopySelection(state) {
      const stamps = gameModelSelectionModel
              .get('local', state.game.model_selection);
      R.thread(state.game)(
        R.prop('models'),
        gameModelsModel.copyStamps$(stamps),
        (copy) => {
          appStateService
            .chainReduce('Game.model.copy', copy);
        }
      );
    }
    function modelsToggleLock(state) {
      const stamps = gameModelSelectionModel
              .get('local', state.game.model_selection);
      R.thread(state.game)(
        R.prop('models'),
        gameModelsModel.findStamp$(stamps[0]),
        R.unless(
          R.isNil,
          R.pipe(
            modelModel.isLocked,
            (present) => {
              appStateService
                .chainReduce('Game.command.execute',
                             'lockModels', [ !present, stamps]);
            }
          )
        )
      );
    }
    function modelsToggleImageDisplay(state) {
      const stamps = gameModelSelectionModel
            .get('local', state.game.model_selection);
      R.thread(state.game)(
        R.prop('models'),
        gameModelsModel.findStamp$(stamps[0]),
        modelModel.isImageDisplayed,
        (present) => {
          appStateService
            .chainReduce('Game.command.execute',
                         'onModels',
                         [ 'setImageDisplay', [!present], stamps]);
        }
      );
    }
    function modelsSetNextImage(state) {
      const stamps = gameModelSelectionModel
              .get('local', state.game.model_selection);
      appStateService
        .chainReduce('Game.command.execute',
                     'onModels',
                     [ 'setNextImage', [state.factions], stamps]);
    }
    function modelsToggleWreckDisplay(state) {
      const stamps = gameModelSelectionModel
              .get('local', state.game.model_selection);
      R.thread(state.game)(
        R.prop('models'),
        gameModelsModel.findStamp$(stamps[0]),
        modelModel.isWreckDisplayed,
        (present) => {
          appStateService
            .chainReduce('Game.command.execute',
                         'onModels',
                         [ 'setWreckDisplay', [!present], stamps]);
        }
      );
    }
    function modelsToggleUnitDisplay(state) {
      const stamps = gameModelSelectionModel
            .get('local', state.game.model_selection);
      R.thread(state.game)(
        R.prop('models'),
        gameModelsModel.findStamp$(stamps[0]),
        R.unless(
          R.isNil,
          R.pipe(
            modelModel.isUnitDisplayed,
            (present) => {
              appStateService
                .chainReduce('Game.command.execute',
                             'onModels',
                             [ 'setUnitDisplay', [!present], stamps]);
            }
          )
        )
      );
    }
    function modelsSetUnit(state) {
      const stamps = gameModelSelectionModel
            .get('local', state.game.model_selection);
      return R.thread(state.game)(
        R.prop('models'),
        gameModelsModel.findStamp$(stamps[0]),
        R.unless(
          R.isNil,
          (model) => R.threadP(model)(
            modelModel.unit,
            R.defaultTo(0),
            (value) => promptService
              .promptP('prompt', 'Set unit number :', value)
              .catch(R.always(null)),
            (value) => {
              appStateService
                .chainReduce('Game.command.execute',
                             'onModels',
                             [ 'setUnit', [value], stamps]);
            }
          )
        )
      );
    }
    function modelsToggleMeleeDisplay(state) {
      const stamps = gameModelSelectionModel
            .get('local', state.game.model_selection);
      R.thread(state.game)(
        R.prop('models'),
        gameModelsModel.findStamp$(stamps[0]),
        R.unless(
          R.isNil,
          R.pipe(
            modelModel.isMeleeDisplayed$('mm'),
            (present) => {
              appStateService
                .chainReduce('Game.command.execute',
                             'onModels',
                             [ 'setMeleeDisplay', ['mm', !present], stamps]);
            }
          )
        )
      );
    }
    function modelsToggleReachDisplay(state) {
      const stamps = gameModelSelectionModel
            .get('local', state.game.model_selection);
      R.thread(state.game)(
        R.prop('models'),
        gameModelsModel.findStamp$(stamps[0]),
        R.unless(
          R.isNil,
          R.pipe(
            modelModel.isMeleeDisplayed$('mr'),
            (present) => {
              appStateService
                .chainReduce('Game.command.execute',
                             'onModels',
                             [ 'setMeleeDisplay', ['mr', !present], stamps]);
            }
          )
        )
      );
    }
    function modelsToggleStrikeDisplay(state) {
      const stamps = gameModelSelectionModel
            .get('local', state.game.model_selection);
      R.thread(state.game)(
        R.prop('models'),
        gameModelsModel.findStamp$(stamps[0]),
        R.unless(
          R.isNil,
          R.pipe(
            modelModel.isMeleeDisplayed$('ms'),
            (present) => {
              appStateService
                .chainReduce('Game.command.execute',
                             'onModels',
                             [ 'setMeleeDisplay', ['ms', !present], stamps]);
            }
          )
        )
      );
    }
    function modelsToggleCounterDisplay(state) {
      const stamps = gameModelSelectionModel
              .get('local', state.game.model_selection);
      R.thread(state.game)(
        R.prop('models'),
        gameModelsModel.findStamp$(stamps[0]),
        modelModel.isCounterDisplayed$('c'),
        (present) => {
          appStateService
            .chainReduce('Game.command.execute',
                         'onModels',
                         [ 'setCounterDisplay', ['c', !present], stamps]);
        }
      );
    }
    function modelsIncrementCounter(state) {
      const stamps = gameModelSelectionModel
            .get('local', state.game.model_selection);
      appStateService
        .chainReduce('Game.command.execute',
                     'onModels',
                     [ 'incrementCounter', ['c'], stamps]);
    }
    function modelsDecrementCounter(state) {
      const stamps = gameModelSelectionModel
            .get('local', state.game.model_selection);
      appStateService
        .chainReduce('Game.command.execute',
                     'onModels',
                     [ 'decrementCounter', ['c'], stamps]);
    }
    function modelsToggleSoulsDisplay(state) {
      const stamps = gameModelSelectionModel
            .get('local', state.game.model_selection);
      R.thread(state.game)(
        R.prop('models'),
        gameModelsModel.findStamp$(stamps[0]),
        modelModel.isCounterDisplayed$('s'),
        (present) => {
          appStateService
            .chainReduce('Game.command.execute',
                         'onModels',
                         [ 'setCounterDisplay', ['s', !present], stamps]);
        }
      );
    }
    function modelsIncrementSouls(state) {
      const stamps = gameModelSelectionModel
            .get('local', state.game.model_selection);
      appStateService
        .chainReduce('Game.command.execute',
                     'onModels',
                     [ 'incrementCounter', ['s'], stamps]);
    }
    function modelsDecrementSouls(state) {
      const stamps = gameModelSelectionModel
            .get('local', state.game.model_selection);
      appStateService
        .chainReduce('Game.command.execute',
                     'onModels',
                     [ 'decrementCounter', ['s'], stamps]);
    }
    // function modelsSetRulerMaxLength(state) {
    //   const stamps = gameModelSelectionModel
    //           .get('local', state.game.model_selection);
    //   return R.threadP(state.game)(
    //     R.prop('models'),
    //     gameModelsModel.findStampP$(stamps[0]),
    //     modelModel.rulerMaxLength,
    //     R.defaultTo(0),
    //     (value) => promptService
    //       .promptP('prompt', 'Set ruler max length :', value)
    //       .catch(R.always(null)),
    //     (value) => (value === 0) ? null : value,
    //     (value) => state.eventP('Game.command.execute',
    //                             'onModels',
    //                             [ 'setRulerMaxLength', [value], stamps])
    //   );
    // }
    function modelsSetChargeMaxLength(state) {
      const stamps = gameModelSelectionModel
              .get('local', state.game.model_selection);
      return R.threadP(state.game)(
        R.prop('models'),
        gameModelsModel.findStamp$(stamps[0]),
        R.unless(
          R.isNil,
          (model) => R.threadP(model)(
            modelModel.chargeMaxLength,
            (value) => promptService
              .promptP('prompt', 'Set charge max length :', value)
              .catch(R.always(null)),
            (value) => (value === 0) ? null : value,
            (value) => {
              appStateService
                .chainReduce('Game.command.execute',
                             'onModels', [
                               'setChargeMaxLength',
                               [state.factions, value],
                               stamps
                             ]);
            }
          )
        )
      );
    }
    // function modelsSetPlaceMaxLength(state) {
    //   const stamps = gameModelSelectionModel
    //           .get('local', state.game.model_selection);
    //   return R.threadP(state.game)(
    //     R.prop('models'),
    //     gameModelsModel.findStampP$(stamps[0]),
    //     modelModel.placeMaxLength,
    //     R.defaultTo(0),
    //     (value) => promptService
    //       .promptP('prompt','Set place max length :', value)
    //       .catch(R.always(null)),
    //     (value) => (value === 0) ? null : value,
    //     (value) => state.eventP('Game.command.execute',
    //                             'onModels', [
    //                               'setPlaceMaxLengthP',
    //                               [state.factions, value],
    //                               stamps
    //                             ])
    //   );
    // }
    // function modelsTogglePlaceWithin(state) {
    //   const stamps = gameModelSelectionModel
    //           .get('local', state.game.model_selection);
    //   return R.threadP(state.game)(
    //     R.prop('models'),
    //     gameModelsModel.findStampP$(stamps[0]),
    //     modelModel.placeWithin,
    //     (present) => state.eventP('Game.command.execute',
    //                               'onModels', [
    //                                 'setPlaceWithinP',
    //                                 [state.factions, !present],
    //                                 stamps
    //                               ])
    //   );
    // }
    function modelsToggleLeaderDisplay(state) {
      const stamps = gameModelSelectionModel
              .get('local', state.game.model_selection);
      R.thread(state.game)(
        R.prop('models'),
        gameModelsModel.findStamp$(stamps[0]),
        R.unless(
          R.isNil,
          R.pipe(
            modelModel.isLeaderDisplayed,
            (present) => {
              appStateService
                .chainReduce('Game.command.execute',
                             'onModels',
                             [ 'setLeaderDisplay', [!present], stamps ]);
            }
          )
        )
      );
    }
    function modelsToggleIncorporealDisplay(state) {
      const stamps = gameModelSelectionModel
              .get('local', state.game.model_selection);
      R.thread(state.game)(
        R.prop('models'),
        gameModelsModel.findStamp$(stamps[0]),
        modelModel.isIncorporealDisplayed,
        (present) => {
          appStateService
            .chainReduce('Game.command.execute',
                         'onModels',
                         [ 'setIncorporealDisplay', [!present], stamps ]);
        }
      );
    }
    function modelsToggleEffect([effect, flag]) {
      models_actions[`toggle${effect}EffectDisplay`] = modelsToggleEffect_;

      function modelsToggleEffect_(state) {
        const stamps = gameModelSelectionModel
                .get('local', state.game.model_selection);
        R.thread(state.game)(
          R.prop('models'),
          gameModelsModel.findStamp$(stamps[0]),
          R.unless(
            R.isNil,
            R.pipe(
              modelModel.isEffectDisplayed$(flag),
              (present) => {
                appStateService
                  .chainReduce('Game.command.execute',
                               'onModels', [
                                 'setEffectDisplay',
                                 [flag, !present],
                                 stamps
                               ]);
              }
            )
          )
        );
      }
    }
    function modelsToggleAura([aura, hex]) {
      models_actions['toggle'+aura+'AuraDisplay'] = modelsToggleAura_;

      function modelsToggleAura_(state) {
        const stamps = gameModelSelectionModel
                .get('local', state.game.model_selection);
        R.thread(state.game)(
          R.prop('models'),
          gameModelsModel.findStamp$(stamps[0]),
          R.unless(
            R.isNil,
            R.pipe(
              modelModel.auraDisplay,
              (present) => {
                appStateService
                .chainReduce('Game.command.execute',
                             'onModels', [
                               'setAuraDisplay',
                               [(present === hex) ? null : hex],
                               stamps
                             ]);
              }
            )
          )
        );
      }
    }
    function modelsToggleCtrlAreaDisplay(state) {
      const stamps = gameModelSelectionModel
              .get('local', state.game.model_selection);
      R.thread(state.game)(
        R.prop('models'),
        gameModelsModel.findStamp$(stamps[0]),
        R.unless(
          R.isNil,
          R.pipe(
            modelModel.isCtrlAreaDisplayed$(state.factions),
            (present) => {
              appStateService
                .chainReduce('Game.command.execute',
                             'onModels', [
                               'setCtrlAreaDisplay',
                               [!present],
                               stamps
                             ]);
            }
          )
        )
      );
    }
    function modelsToggleAreaDisplay(area) {
      const size = area === 0 ? 10 : area;
      models_actions[`toggle${size}InchesAreaDisplay`] =
        modelsToggleAreaDisplay_(size);
      const big_size = size + 10;
      models_actions[`toggle${big_size}InchesAreaDisplay`] =
        modelsToggleAreaDisplay_(big_size);

      function modelsToggleAreaDisplay_(size) {
        return function modelsToggleSizeAreaDisplay(state) {
          const stamps = gameModelSelectionModel
                  .get('local', state.game.model_selection);
          return R.thread(state.game)(
            R.prop('models'),
            gameModelsModel.findStamp$(stamps[0]),
            R.unless(
              R.isNil,
              R.pipe(
                modelModel.areaDisplay,
                (present) => {
                  appStateService
                    .chainReduce('Game.command.execute',
                                 'onModels', [
                                   'setAreaDisplay',
                                   [(present === size) ? null : size],
                                   stamps
                                 ]);
                }
              )
            )
          );
        };
      }
    }
    function modelsMove([move, _key_]) {
      models_actions[move] = modelsMove_(false);
      models_actions[`${move}Small`] = modelsMove_(true);

      function modelsMove_(small) {
        return function modelsSmallMove(state) {
          const stamps = gameModelSelectionModel
                  .get('local', state.game.model_selection);
          appStateService
            .chainReduce('Game.command.execute',
                         'onModels',
                         [ move+'P', [state.factions, small], stamps ]);
        };
      }
    }
    function modelsShift([shift, _key_, flip_shift]) {
      models_actions[shift] = modelsShift_(false);
      models_actions[`${shift}Small`] = modelsShift_(true);

      function modelsShift_(small) {
        return function modelsShiftSmall(state) {
          const stamps = gameModelSelectionModel
                  .get('local', state.game.model_selection);
          const model_shift = ( R.path(['ui_state', 'flip_map'], state)
                                ? flip_shift
                                : shift
                              );
          appStateService
            .chainReduce('Game.command.execute',
                         'onModels', [
                           model_shift+'P',
                           [state.factions, small],
                           stamps
                         ]);
        };
      }
    }
    function modelsSetOrientationUp(state) {
      const stamps = gameModelSelectionModel
              .get('local', state.game.model_selection);
      const orientation = state.ui_state.flip_map ? 180 : 0;
      appStateService
        .chainReduce('Game.command.execute',
                     'onModels', [
                       'setOrientationP',
                       [state.factions, orientation],
                       stamps
                     ]);
    }
    function modelsSetOrientationDown(state) {
      const stamps = gameModelSelectionModel
              .get('local', state.game.model_selection);
      const orientation = state.ui_state.flip_map ? 0 : 180;
      appStateService
        .chainReduce('Game.command.execute',
                     'onModels', [
                       'setOrientationP',
                       [state.factions, orientation],
                       stamps
                     ]);
    }
    function modelsSetTargetModel(state, event) {
      const stamps = gameModelSelectionModel
              .get('local', state.game.model_selection);
      appStateService
        .chainReduce('Game.command.execute',
                     'onModels', [
                       'orientToP',
                       [state.factions, event['click#'].target],
                       stamps
                     ]);
    }
    function modelsClearLabel(state) {
      const stamps = gameModelSelectionModel
              .get('local', state.game.model_selection);
      appStateService
        .chainReduce('Game.command.execute',
                     'onModels',
                     [ 'clearLabel', [], stamps]);
    }

    function modelsDrag() {
      let drag_charge_target;
      let drag_models_start_states;
      let drag_models_start_selection;

      models_actions.dragStartModel = modelsDragStart;
      defaultModeModel.actions.dragStartModel = modelsDragStart;
      models_actions.dragModel = modelsDragContinue;
      defaultModeModel.actions.dragModel = modelsDragContinue;
      models_actions.dragEndModel = modelsDragEnd;
      defaultModeModel.actions.dragEndModel = modelsDragEnd;

      function modelsDragStart(state, event) {
        const stamp = event.target.state.stamp;
        return R.thread(state.game)(
          resolveModelSelection,
          gameModelsModel.findAnyStamps$(R.__, state.game.models),
          R.reject(R.isNil),
          R.tap(initDragChargeTarget),
          R.tap((models) => { drag_models_start_selection = models; }),
          R.map(modelModel.saveState),
          R.tap((states) => { drag_models_start_states = states; }),
          () => modelsDragContinue(state, event)
        );

        function resolveModelSelection() {
          return R.thread(state.game)(
            R.prop('model_selection'),
            R.ifElse(
              gameModelSelectionModel.in$('local', stamp),
              gameModelSelectionModel.get$('local'),
              () => {
                appStateService
                  .chainReduce('Game.command.execute',
                               'setModelSelection',
                               ['set', [stamp]]);
                return [stamp];
              }
            )
          );
        }
        function initDragChargeTarget(models) {
          drag_charge_target = null;
          if(R.length(models) !== 1) return;

          R.thread(models)(
            R.head,
            modelModel.chargeTarget,
            R.unless(
              R.isNil,
              R.pipe(
                gameModelsModel.findStamp$(R.__, state.game.models),
                (target_model) => {
                  drag_charge_target = target_model;
                }
              )
            )
          );
        }
      }
      function modelsDragContinue(state, event) {
        return R.threadP(drag_models_start_selection)(
          R.addIndex(R.map)(updateDragedModelPositionP),
          R.allP,
          R.reject(R.isNil),
          R.forEach(emitModelChangeEvent)
        );

        function updateDragedModelPositionP(model, index) {
          const pos = {
            x: drag_models_start_states[index].x + event.now.x - event.start.x,
            y: drag_models_start_states[index].y + event.now.y - event.start.y
          };
          return modelModel
            .setPositionP_(state.factions, drag_charge_target, pos, model)
            .catch(() => null);
        }
        function emitModelChangeEvent(model) {
          appStateService.emit(`Game.model.change.${model.state.stamp}`);
        }
      }
      function modelsDragEnd(state, event) {
        return R.threadP(drag_models_start_selection)(
          R.addIndex(R.map)(resetDragedModelPositionP),
          R.allP,
          R.reject(R.isNil),
          R.map(R.path(['state','stamp'])),
          setFinalPositions
        );

        function resetDragedModelPositionP(model, index) {
          return modelModel
            .setPositionP_(state.factions, drag_charge_target,
                           drag_models_start_states[index], model)
            .catch(() => null);
        }
        function setFinalPositions(stamps) {
          const shift = {
            x: event.now.x - event.start.x,
            y: event.now.y - event.start.y
          };
          appStateService
            .chainReduce('Game.command.execute',
                         'onModels', [
                           'shiftPositionP',
                           [state.factions, drag_charge_target, shift],
                           stamps
                         ]);
        }
      }
    }

    function modelsBindMove([move, keys]) {
      models_default_bindings[move] = keys;
      models_default_bindings[move+'Small'] = 'shift+'+keys;
    }
    function modelsBindShift([shift, keys]) {
      models_default_bindings[shift] = keys;
      models_default_bindings[shift+'Small'] = 'shift+'+keys;
    }
    function modelsBindArea(area) {
      let size = area === 0 ? 10 : area;
      models_default_bindings[`toggle${size}InchesAreaDisplay`] = `alt+${area}`;
      size += 10;
      models_default_bindings[`toggle${size}InchesAreaDisplay`] = `alt+shift+${area}`;
    }
    function modelsBindAura([aura], index) {
      models_default_bindings[`toggle${aura}AuraDisplay`] = `ctrl+${index+1}`;
    }
    function modelsBindEffect([effect, keys]) {
      models_default_bindings[`toggle${effect}EffectDisplay`] = `alt+${keys}`;
    }

    function buildModelsModesButtons({ single,
                                       start_charge, end_charge,
                                       start_place, end_place
                                     } = {}) {
      let ret = [
        [ 'Delete', 'deleteSelection' ],
        [ 'Copy', 'copySelection' ],
        [ 'Lock', 'toggleLock' ],
        // [ 'Ruler Max Len.', 'setRulerMaxLength' ],
        [ 'Clear Label', 'clearLabel' ],
        [ 'Image', 'toggle', 'image' ],
        [ 'Show/Hide', 'toggleImageDisplay', 'image' ],
        [ 'Next', 'setNextImage', 'image' ],
        [ 'Wreck', 'toggleWreckDisplay', 'image' ],
        [ 'Orient.', 'toggle', 'orientation' ],
        [ 'Face Up', 'setOrientationUp', 'orientation' ],
        [ 'Face Down', 'setOrientationDown', 'orientation' ],
        [ 'Counter', 'toggle', 'counter' ],
        [ 'Show/Hide', 'toggleCounterDisplay', 'counter' ],
        [ 'Inc.', 'incrementCounter', 'counter' ],
        [ 'Dec.', 'decrementCounter', 'counter' ],
        [ 'Souls', 'toggle', 'souls' ],
        [ 'Show/Hide', 'toggleSoulsDisplay', 'souls' ],
        [ 'Inc.', 'incrementSouls', 'souls' ],
        [ 'Dec.', 'decrementSouls', 'souls' ],
        [ 'Melee', 'toggle', 'melee' ],
        [ '0.5"', 'toggleMeleeDisplay', 'melee' ],
        [ 'Reach', 'toggleReachDisplay', 'melee' ],
        [ 'Strike', 'toggleStrikeDisplay', 'melee' ],
      ];
      if(single) {
        ret = R.concat(ret, [ [ 'Templates', 'toggle', 'templates' ],
                              [ 'AoE', 'createAoEOnModel', 'templates' ],
                              [ 'Spray', 'createSprayOnModel', 'templates' ],
                            ]);
      }
      ret = R.append([ 'Areas', 'toggle', 'areas' ], ret);
      ret = R.append([ 'CtrlArea', 'toggleCtrlAreaDisplay', 'areas' ], ret);
      ret = R.concat(ret, R.map((area) => {
        const size = area + 1;
        return [ `${size}"`, `toggle${size}InchesAreaDisplay`, 'areas' ];
      }, areas));
      ret = R.concat(ret, R.map((area) => {
        const size = area + 11;
        return [ `${size}"`, `toggle${size}InchesAreaDisplay`, 'areas' ];
      }, areas));
      ret = R.append([ 'Auras', 'toggle', 'auras' ], ret);
      ret = R.concat(ret, R.map(([aura]) => {
        return [ aura, `toggle${aura}AuraDisplay`, 'auras' ];
      }, auras));
      ret = R.append([ 'Effects', 'toggle', 'effects' ], ret);
      ret = R.concat(ret, R.map(([effect]) => {
        return [ effect, `toggle${effect}EffectDisplay`, 'effects' ];
      }, effects));
      ret = R.append([ 'Incorp.', 'toggleIncorporealDisplay', 'effects' ], ret);
      ret = R.append([ 'Charge', 'toggle', 'charge' ], ret);
      if(start_charge) {
        ret = R.append([ 'Start', 'startCharge', 'charge' ], ret);
      }
      if(end_charge) {
        ret = R.append([ 'End', 'endCharge', 'charge' ], ret);
      }
      ret = R.append([ 'Max Len.', 'setChargeMaxLength', 'charge' ], ret);
      // ret = R.append([ 'Place', 'toggle', 'place' ], ret);
      // if(start_place) {
      //   ret = R.append([ 'Start', 'startPlace', 'place' ], ret);
      // }
      // if(end_place) {
      //   ret = R.append([ 'End', 'endPlace', 'place' ], ret);
      // }
      // ret = R.append([ 'Max Len.', 'setPlaceMaxLength', 'place' ], ret);
      // ret = R.append([ 'Within', 'togglePlaceWithin', 'place' ], ret);
      ret = R.concat(ret, [ [ 'Unit', 'toggle', 'unit' ],
                            [ 'Show/Hide', 'toggleUnitDisplay', 'unit' ],
                            [ 'Set #', 'setUnit', 'unit' ],
                            [ 'Leader', 'toggleLeaderDisplay', 'unit' ],
                          ]);
      if(single) {
        ret = R.append([ 'Select All', 'selectAllUnit', 'unit' ], ret);
        ret = R.append([ 'Select Friends', 'selectAllFriendly' ], ret);
      }

      return ret;
    }
  }
})();
