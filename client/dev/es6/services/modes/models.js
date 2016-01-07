angular.module('clickApp.services')
  .factory('modelsMode', [
    'modes',
    'settings',
    'defaultMode',
    'model',
    'game',
    'gameModels',
    'gameModelSelection',
    'point',
    'prompt',
    function modelsModeServiceFactory(modesService,
                                      settingsService,
                                      defaultModeService,
                                      modelService,
                                      gameService,
                                      gameModelsService,
                                      gameModelSelectionService,
                                      pointService,
                                      promptService) {
      let models_actions = Object.create(defaultModeService.actions);
      function modelsClearSelection(state) {
        return state.event('Game.command.execute',
                           'setModelSelection', [ 'clear', null ]);
      }
      models_actions.clickMap = modelsClearSelection;
      models_actions.rightClickMap = modelsClearSelection;
      models_actions.modeBackToDefault = modelsClearSelection;
      models_actions.deleteSelection = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return state.event('Game.command.execute',
                           'deleteModel', [stamps]);
      };
      models_actions.toggleLock = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return R.pipeP(
          gameModelsService.findStamp$(stamps[0]),
          modelService.isLocked,
          (present) => {
            return state.event('Game.command.execute',
                               'lockModels', [ !present, stamps]);
          }
        )(state.game.models);
      };
      models_actions.toggleImageDisplay = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return R.pipeP(
          gameModelsService.findStamp$(stamps[0]),
          modelService.isImageDisplayed,
          (present) => {
            return state.event('Game.command.execute',
                               'onModels', [ 'setImageDisplay', [!present], stamps]);
          }
        )(state.game.models);
      };
      models_actions.setNextImage = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return state.event('Game.command.execute',
                           'onModels', [ 'setNextImage', [state.factions], stamps]);
      };
      models_actions.toggleWreckDisplay = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return R.pipeP(
          gameModelsService.findStamp$(stamps[0]),
          modelService.isWreckDisplayed,
          (present) => {
            return state.event('Game.command.execute',
                               'onModels', [ 'setWreckDisplay', [!present], stamps]);
          }
        )(state.game.models);
      };
      models_actions.toggleUnitDisplay = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return R.pipeP(
          gameModelsService.findStamp$(stamps[0]),
          modelService.isUnitDisplayed,
          (present) => {
            return state.event('Game.command.execute',
                               'onModels', [ 'setUnitDisplay', [!present], stamps]);
          }
        )(state.game.models);
      };
      models_actions.setUnit = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return R.pipeP(
          gameModelsService.findStamp$(stamps[0]),
          (model) => {
            let value = R.defaultTo(0, modelService.unit(model));

            return promptService
              .prompt('prompt', 'Set unit number :', value)
              .catch(R.always(null));
          },
          (value) => {
            return state.event('Game.command.execute',
                               'onModels', [ 'setUnit', [value], stamps]);
          }
        )(state.game.models);
      };
      models_actions.toggleMeleeDisplay = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return R.pipeP(
          gameModelsService.findStamp$(stamps[0]),
          modelService.isMeleeDisplayed$('mm'),
          (present) => {
            return state.event('Game.command.execute',
                               'onModels', [ 'setMeleeDisplay', ['mm', !present], stamps]);
          }
        )(state.game.models);
      };
      models_actions.toggleReachDisplay = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return R.pipeP(
          gameModelsService.findStamp$(stamps[0]),
          modelService.isMeleeDisplayed$('mr'),
          (present) => {
            return state.event('Game.command.execute',
                               'onModels', [ 'setMeleeDisplay', ['mr', !present], stamps]);
          }
        )(state.game.models);
      };
      models_actions.toggleStrikeDisplay = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return R.pipeP(
          gameModelsService.findStamp$(stamps[0]),
          modelService.isMeleeDisplayed$('ms'),
          (present) => {
            return state.event('Game.command.execute',
                               'onModels', [ 'setMeleeDisplay', ['ms', !present], stamps]);
          }
        )(state.game.models);
      };
      models_actions.toggleCounterDisplay = (state) => {
        let stamps = gameModelSelectionService.get('local', state.game.model_selection);
        return R.pipeP(
          gameModelsService.findStamp$(stamps[0]),
          modelService.isCounterDisplayed$('c'),
          (present) => {
            return state.event('Game.command.execute',
                               'onModels', [ 'setCounterDisplay', ['c', !present], stamps]);
          }
        )(state.game.models);
      };
      models_actions.incrementCounter = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return state.event('Game.command.execute',
                           'onModels', [ 'incrementCounter', ['c'], stamps]);
      };
      models_actions.decrementCounter = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return state.event('Game.command.execute',
                           'onModels', [ 'decrementCounter', ['c'], stamps]);
      };
      models_actions.toggleSoulsDisplay = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return R.pipeP(
          gameModelsService.findStamp$(stamps[0]),
          modelService.isCounterDisplayed$('s'),
          (present) => {
            return state.event('Game.command.execute',
                               'onModels', [ 'setCounterDisplay', ['s', !present], stamps]);
          }
        )(state.game.models);
      };
      models_actions.incrementSouls = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return state.event('Game.command.execute',
                           'onModels', [ 'incrementCounter', ['s'], stamps]);
      };
      models_actions.decrementSouls = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return state.event('Game.command.execute',
                           'onModels', [ 'decrementCounter', ['s'], stamps]);
      };
      models_actions.setRulerMaxLength = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return R.pipeP(
          gameModelsService.findStamp$(stamps[0]),
          modelService.rulerMaxLength,
          R.defaultTo(0),
          (value) => {
            return promptService
              .prompt('prompt', 'Set ruler max length :', value)
              .catch(R.always(null));
          },
          (value) => {
            value = (value === 0) ? null : value;

            return state.event('Game.command.execute',
                               'onModels', [ 'setRulerMaxLength', [value], stamps]);
          }
        )(state.game.models);
      };
      models_actions.setChargeMaxLength = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return R.pipeP(
          gameModelsService.findStamp$(stamps[0]),
          modelService.chargeMaxLength,
          (value) => {
            return promptService
              .prompt('prompt', 'Set charge max length :', value)
              .catch(R.always(null));
          },
          (value) => {
            value = (value === 0) ? null : value;

            return state.event('Game.command.execute',
                               'onModels', [ 'setChargeMaxLength',
                                             [state.factions, value],
                                             stamps
                                           ]);
          }
        )(state.game.models);
      };
      models_actions.setPlaceMaxLength = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return R.pipeP(
          gameModelsService.findStamp$(stamps[0]),
          modelService.placeMaxLength,
          R.defaultTo(0),
          (value) => {
            return promptService
              .prompt('prompt','Set place max length :', value)
              .catch(R.always(null));
          },
          (value) => {
            value = (value === 0) ? null : value;

            return state.event('Game.command.execute',
                               'onModels', [ 'setPlaceMaxLength',
                                             [state.factions, value],
                                             stamps
                                           ]);
          }
        )(state.game.models);
      };
      models_actions.togglePlaceWithin = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return R.pipeP(
          gameModelsService.findStamp$(stamps[0]),
          modelService.placeWithin,
          (present) => {
            return state.event('Game.command.execute',
                               'onModels', [ 'setPlaceWithin',
                                             [state.factions, !present],
                                             stamps
                                           ]);
          }
        )(state.game.models);
      };
      models_actions.toggleLeaderDisplay = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return R.pipeP(
          gameModelsService.findStamp$(stamps[0]),
          modelService.isLeaderDisplayed,
          (present) => {
            return state.event('Game.command.execute',
                               'onModels', [ 'setLeaderDisplay', [!present], stamps ]);
          }
        )(state.game.models);
      };
      models_actions.toggleIncorporealDisplay = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return R.pipeP(
          gameModelsService.findStamp$(stamps[0]),
          modelService.isIncorporealDisplayed,
          (present) => {
            return state.event('Game.command.execute',
                               'onModels', [ 'setIncorporealDisplay', [!present], stamps ]);
          }
        )(state.game.models);
      };
      let effects = [
        [ 'Blind', 'b' ],
        [ 'Corrosion', 'c' ],
        [ 'Disrupt', 'd' ],
        [ 'Fire', 'f' ],
        [ 'Fleeing', 'e' ],
        [ 'KD', 'k' ],
        [ 'Stationary', 't' ],
      ];
      R.forEach(([effect, flag]) => {
        models_actions['toggle'+effect+'EffectDisplay'] = (state) => {
          let stamps = gameModelSelectionService
                .get('local', state.game.model_selection);
          return R.pipeP(
            gameModelsService.findStamp$(stamps[0]),
            modelService.isEffectDisplayed$(flag),
            (present) => {
              return state.event('Game.command.execute',
                                 'onModels', [ 'setEffectDisplay', [flag, !present], stamps]);
            }
          )(state.game.models);
        };
      }, effects);
      let auras = [
        [ 'Red', '#F00' ],
        [ 'Green', '#0F0' ],
        [ 'Blue', '#00F' ],
        [ 'Yellow', '#FF0' ],
        [ 'Purple', '#F0F' ],
        [ 'Cyan', '#0FF' ],
      ];
      R.forEach(([aura, hex]) => {
        models_actions['toggle'+aura+'AuraDisplay'] = (state) => {
          let stamps = gameModelSelectionService
                .get('local', state.game.model_selection);
          return R.pipeP(
            gameModelsService.findStamp$(stamps[0]),
            modelService.auraDisplay,
            (present) => {
              return state.event('Game.command.execute',
                                 'onModels', [ 'setAuraDisplay',
                                               [(present === hex) ? null : hex],
                                               stamps
                                             ]);
            }
          )(state.game.models);
        };
      }, auras);
      models_actions.toggleCtrlAreaDisplay = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return R.pipeP(
          gameModelsService.findStamp$(stamps[0]),
          modelService.isCtrlAreaDisplayed$(state.factions),
          (present) => {
            return state.event('Game.command.execute',
                               'onModels', [ 'setCtrlAreaDisplay', [!present], stamps]);
          }
        )(state.game.models);
      };
      let areas = R.range(0, 10);
      R.forEach((area) => {
        let size = area === 0 ? 10 : area;
        models_actions['toggle'+size+'InchesAreaDisplay'] = (state) => {
          let stamps = gameModelSelectionService
                .get('local', state.game.model_selection);
          return R.pipeP(
            gameModelsService.findStamp$(stamps[0]),
            (model) => {
              let present = modelService.areaDisplay(model);

              return state.event('Game.command.execute',
                                 'onModels', [ 'setAreaDisplay',
                                               [(present === size) ? null : size],
                                               stamps
                                             ]);
            }
          )(state.game.models);
        };
        let big_size = size + 10;
        models_actions['toggle'+big_size+'InchesAreaDisplay'] = (state) => {
          let stamps = gameModelSelectionService
                .get('local', state.game.model_selection);
          return R.pipeP(
            gameModelsService.findStamp$(stamps[0]),
            (model) => {
              let present = modelService.areaDisplay(model);

              return state.event('Game.command.execute',
                                 'onModels', [ 'setAreaDisplay',
                                               [(present === big_size) ? null : big_size],
                                               stamps
                                             ]);
              }
            )(state.game.models);
          };
      }, areas);
      let moves = [
        ['moveFront', 'up'],
        ['moveBack', 'down'],
        ['rotateLeft', 'left'],
        ['rotateRight', 'right'],
      ];
      R.forEach(([move, key]) => {
        key = key;
        models_actions[move] = (state) => {
          let stamps = gameModelSelectionService
                .get('local', state.game.model_selection);
          return state.event('Game.command.execute',
                             'onModels', [ move, [state.factions, false], stamps ]);
        };
        models_actions[move+'Small'] = (state) => {
          let stamps = gameModelSelectionService
                .get('local', state.game.model_selection);
          return state.event('Game.command.execute',
                             'onModels', [ move, [state.factions, true], stamps ]);
        };
      }, moves);
      let shifts = [
        ['shiftUp', 'ctrl+up', 'shiftDown'],
        ['shiftDown', 'ctrl+down', 'shiftUp'],
        ['shiftLeft', 'ctrl+left', 'shiftRight'],
        ['shiftRight', 'ctrl+right', 'shiftLeft'],
      ];
      R.forEach(([shift, key, flip_shift]) => {
        key = key;
        models_actions[shift] = (state) => {
          let stamps = gameModelSelectionService
                .get('local', state.game.model_selection);
          let model_shift = ( R.path(['ui_state', 'flip_map'], state) ?
                              flip_shift :
                              shift
                            );
          return state.event('Game.command.execute',
                             'onModels', [ model_shift, [state.factions, false], stamps ]);
        };
        models_actions[shift+'Small'] = (state) => {
          let stamps = gameModelSelectionService
                .get('local', state.game.model_selection);
          let model_shift = ( R.path(['ui_state', 'flip_map'], state) ?
                              flip_shift :
                              shift
                            );
          return state.event('Game.command.execute',
                             'onModels', [ model_shift, [state.factions, true], stamps ]);
        };
      }, shifts);
      models_actions.setOrientationUp = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        let orientation = state.ui_state.flip_map ? 180 : 0;
        state.event('Game.command.execute',
                    'onModels', [ 'setOrientation',
                                  [state.factions, orientation],
                                  stamps
                                ]);
      };
      models_actions.setOrientationDown = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        let orientation = state.ui_state.flip_map ? 0 : 180;
        state.event('Game.command.execute',
                    'onModels', [ 'setOrientation',
                                  [state.factions, orientation],
                                  stamps
                                ]);
      };
      models_actions.setTargetModel = (state, event) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return state.event('Game.command.execute',
                           'onModels', [ 'orientTo',
                                         [state.factions, event['click#'].target],
                                         stamps
                                       ]);
      };

      (() => {
        let drag_charge_target;
        let drag_models_start_states;
        let drag_models_start_selection;
        models_actions.dragStartModel = (state, event) => {
          let stamp = event.target.state.stamp;
          return R.pipePromise(
            () => {
              let in_selection = gameModelSelectionService
                    .in('local', stamp, state.game.model_selection);
              if(in_selection) return null;

              return state.event('Game.command.execute',
                                 'setModelSelection', ['set', [stamp]]);
            },
            () => {
              return gameModelSelectionService
                .get('local', state.game.model_selection);
            },
            (stamps) => {
              return gameModelsService
                .findAnyStamps(stamps, state.game.models);
            },
            R.reject(R.isNil),
            (models) => {
              drag_charge_target = null;
              if(R.length(models) === 1) {
                R.pipeP(
                  modelService.chargeTarget,
                  (target_stamp) => {
                    return gameModelsService
                      .findStamp(target_stamp, state.game.models);
                  },
                  (target_model) => {
                    drag_charge_target = target_model;
                  }
                )(models[0]);
              }
              return models;
            },
            (models) => {
              drag_models_start_selection = models;

              return R.map(modelService.saveState, models);
            },
            (states) => {
              drag_models_start_states = states;

              return models_actions.dragModel(state, event);
            }
          )();
        };
        defaultModeService.actions.dragStartModel = models_actions.dragStartModel;
        models_actions.dragModel = (state, event) => {
          return R.pipePromise(
            R.addIndex(R.map)((model, index) => {
              let pos = {
                x: drag_models_start_states[index].x + event.now.x - event.start.x,
                y: drag_models_start_states[index].y + event.now.y - event.start.y
              };
              return modelService
                .setPosition_(state.factions, drag_charge_target, pos, model);
            }),
            R.promiseAll,
            R.forEach((model) => {
              state.changeEvent(`Game.model.change.${model.state.stamp}`);
            })
          )(drag_models_start_selection);
        };
        models_actions.dragEndModel = (state, event) => {
          return R.pipePromise(
            R.addIndex(R.map)((model, index) => {
              return modelService
                .setPosition_(state.factions, drag_charge_target,
                             drag_models_start_states[index], model);
            }),
            R.promiseAll,
            R.map(R.path(['state','stamp'])),
            (stamps) => {
              let shift = {
                x: event.now.x - event.start.x,
                y: event.now.y - event.start.y
              };
              return state.event('Game.command.execute',
                                 'onModels', [ 'shiftPosition',
                                               [state.factions, drag_charge_target, shift],
                                               stamps
                                             ]);
            }
          )(drag_models_start_selection);
        };
      })();

      models_actions.copySelection = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return R.pipeP(
          gameModelsService.copyStamps$(stamps),
          (copy) => {
            return state.event('Game.model.copy', copy);
          }
        )(state.game.models);
      };
      models_actions.clearLabel = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return state.event('Game.command.execute',
                           'onModels', [ 'clearLabel', [], stamps]);
      };
      
      let models_default_bindings = {
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
      R.forEach(([move, keys]) => {
        models_default_bindings[move] = keys;
        models_default_bindings[move+'Small'] = 'shift+'+keys;
      }, moves);
      R.forEach(([shift, keys]) => {
        models_default_bindings[shift] = keys;
        models_default_bindings[shift+'Small'] = 'shift+'+keys;
      }, shifts);
      R.forEach((area) => {
        let size = area === 0 ? 10 : area;
        models_default_bindings['toggle'+size+'InchesAreaDisplay'] = 'alt+'+area;
        size += 10;
        models_default_bindings['toggle'+size+'InchesAreaDisplay'] = 'alt+shift+'+area;
      }, areas);
      R.addIndex(R.forEach)(([aura], index) => {
        models_default_bindings['toggle'+aura+'AuraDisplay'] = 'ctrl+'+(index+1);
      }, auras);
      R.forEach(([effect, keys]) => {
        models_default_bindings['toggle'+effect+'EffectDisplay'] = 'alt+'+keys;
      }, effects);
      let models_bindings = R.extend(Object.create(defaultModeService.bindings),
                                     models_default_bindings);

      let models_buttons = buildModelsModesButtons();
      let models_mode = {
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
      modesService.registerMode(models_mode);
      settingsService.register('Bindings',
                               models_mode.name,
                               models_default_bindings,
                               (bs) => {
                                 R.extend(models_mode.bindings, bs);
                               });

      function buildModelsModesButtons({ single,
                                         start_charge, end_charge,
                                         start_place, end_place
                                       } = {}) {
        let ret = [
          [ 'Delete', 'deleteSelection' ],
          [ 'Copy', 'copySelection' ],
          [ 'Lock', 'toggleLock' ],
          [ 'Ruler Max Len.', 'setRulerMaxLength' ],
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
          let size = area + 1;
          return [ size+'"', 'toggle'+size+'InchesAreaDisplay', 'areas' ];
        }, areas));
        ret = R.concat(ret, R.map((area) => {
          let size = area + 11;
          return [ size+'"', 'toggle'+size+'InchesAreaDisplay', 'areas' ];
        }, areas));
        ret = R.append([ 'Auras', 'toggle', 'auras' ], ret);
        ret = R.concat(ret, R.map(([aura]) => {
          return [ aura, 'toggle'+aura+'AuraDisplay', 'auras' ];
        }, auras));
        ret = R.append([ 'Effects', 'toggle', 'effects' ], ret);
        ret = R.concat(ret, R.map(([effect]) => {
          return [ effect, 'toggle'+effect+'EffectDisplay', 'effects' ];
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
        ret = R.append([ 'Place', 'toggle', 'place' ], ret);
        if(start_place) {
          ret = R.append([ 'Start', 'startPlace', 'place' ], ret);
        }
        if(end_place) {
          ret = R.append([ 'End', 'endPlace', 'place' ], ret);
        }
        ret = R.append([ 'Max Len.', 'setPlaceMaxLength', 'place' ], ret);
        ret = R.append([ 'Within', 'togglePlaceWithin', 'place' ], ret);
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
      
      return models_mode;
    }
  ]);
