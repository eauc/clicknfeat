'use strict';

self.modelsModeServiceFactory = function modelsModeServiceFactory(modesService,
                                                                  settingsService,
                                                                  defaultModeService,
                                                                  modelService,
                                                                  gameService,
                                                                  gameModelsService,
                                                                  gameModelSelectionService,
                                                                  promptService) {
  var models_actions = Object.create(defaultModeService.actions);
  models_actions.deleteSelection = function modelsDeleteSeelction(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    gameService.executeCommand('deleteModel', stamps, scope, scope.game);
  };
  models_actions.clickMap = function modelsClickMap(scope, event) {
    gameService.executeCommand('setModelSelection', 'clear', null,
                               scope, scope.game);
  };
  models_actions.rightClickMap = function modelsRightClickMap(scope, event) {
    gameService.executeCommand('setModelSelection', 'clear', null,
                               scope, scope.game);
  };
  models_actions.clickModel = function modelsClickModel(scope, event, dom_event) {
    if(dom_event.shiftKey) {
      var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
      gameService.executeCommand('onModels', 'orientTo', scope.factions, event.target,
                                 stamps, scope, scope.game);
      return;
    }
    defaultModeService.actions.clickModel(scope, event, dom_event);
  };
  models_actions.toggleImageDisplay = function modelToggleImageDisplay(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    var model = gameModelsService.findStamp(stamps[0], scope.game.models);
    var present = modelService.isImageDisplayed(model);
    gameService.executeCommand('onModels', 'setImageDisplay', !present,
                               stamps, scope, scope.game);
  };
  models_actions.toggleWreckDisplay = function modelToggleWreckDisplay(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    var model = gameModelsService.findStamp(stamps[0], scope.game.models);
    var present = modelService.isWreckDisplayed(model);
    gameService.executeCommand('onModels', 'setWreckDisplay', !present,
                               stamps, scope, scope.game);
  };
  models_actions.toggleUnitDisplay = function modelToggleUnitDisplay(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    var model = gameModelsService.findStamp(stamps[0], scope.game.models);
    var present = modelService.isUnitDisplayed(model);
    gameService.executeCommand('onModels', 'setUnitDisplay', !present,
                               stamps, scope, scope.game);
  };
  models_actions.setUnit = function modelSetUnit(scope, event) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    var model = gameModelsService.findStamp(stamps[0], scope.game.models);
    var value = R.defaultTo(0, modelService.unit(model));
    promptService.prompt('prompt',
                         'Set unit number :',
                         value)
      .then(function(value) {
        gameService.executeCommand('onModels', 'setUnit', value,
                                   stamps, scope, scope.game);
        return value;
      })
      .catch(function(error) {
        gameService.executeCommand('onModels', 'setUnit', null,
                                   stamps, scope, scope.game);
        return null;
      });
  };
  models_actions.toggleMeleeDisplay = function modelToggleMeleeDisplay(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    var model = gameModelsService.findStamp(stamps[0], scope.game.models);
    var present = modelService.isMeleeDisplayed('mm', model);
    gameService.executeCommand('onModels', 'setMeleeDisplay', 'mm', !present,
                               stamps, scope, scope.game);
  };
  models_actions.toggleReachDisplay = function modelToggleReachDisplay(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    var model = gameModelsService.findStamp(stamps[0], scope.game.models);
    var present = modelService.isMeleeDisplayed('mr', model);
    gameService.executeCommand('onModels', 'setMeleeDisplay', 'mr', !present,
                               stamps, scope, scope.game);
  };
  models_actions.toggleStrikeDisplay = function modelToggleStrikeDisplay(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    var model = gameModelsService.findStamp(stamps[0], scope.game.models);
    var present = modelService.isMeleeDisplayed('ms', model);
    gameService.executeCommand('onModels', 'setMeleeDisplay', 'ms', !present,
                               stamps, scope, scope.game);
  };
  models_actions.setNextImage = function modelSetNextImage(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    gameService.executeCommand('onModels', 'setNextImage', scope.factions,
                               stamps, scope, scope.game);
  };
  models_actions.toggleCounterDisplay = function modelToggleCounterDisplay(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    var model = gameModelsService.findStamp(stamps[0], scope.game.models);
    var present = modelService.isCounterDisplayed('c', model);
    gameService.executeCommand('onModels', 'setCounterDisplay', 'c', !present,
                               stamps, scope, scope.game);
  };
  models_actions.incrementCounter = function modelIncrementCounter(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    gameService.executeCommand('onModels', 'incrementCounter', 'c',
                               stamps, scope, scope.game);
  };
  models_actions.decrementCounter = function modelDecrementCounter(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    gameService.executeCommand('onModels', 'decrementCounter', 'c',
                               stamps, scope, scope.game);
  };
  models_actions.toggleSoulsDisplay = function modelToggleSoulsDisplay(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    var model = gameModelsService.findStamp(stamps[0], scope.game.models);
    var present = modelService.isCounterDisplayed('s', model);
    gameService.executeCommand('onModels', 'setCounterDisplay', 's', !present,
                               stamps, scope, scope.game);
  };
  models_actions.incrementSouls = function modelIncrementSouls(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    gameService.executeCommand('onModels', 'incrementCounter', 's',
                               stamps, scope, scope.game);
  };
  models_actions.decrementSouls = function modelDecrementSouls(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    gameService.executeCommand('onModels', 'decrementCounter', 's',
                               stamps, scope, scope.game);
  };
  models_actions.setRulerMaxLength = function modelSetRulerMaxLength(scope, event) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    var model = gameModelsService.findStamp(stamps[0], scope.game.models);
    var value = R.defaultTo(0, modelService.rulerMaxLength(model));
    promptService.prompt('prompt',
                         'Set ruler max length :',
                         value)
      .then(function(value) {
        value = (value === 0) ? null : value;
        gameService.executeCommand('onModels', 'setRulerMaxLength', value,
                                   stamps, scope, scope.game);
        return value;
      })
      .catch(function(error) {
        gameService.executeCommand('onModels', 'setRulerMaxLength', null,
                                   stamps, scope, scope.game);
        return null;
      });
  };
  models_actions.setChargeMaxLength = function modelSetChargeMaxLength(scope, event) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    var model = gameModelsService.findStamp(stamps[0], scope.game.models);
    var value = R.defaultTo(0, modelService.chargeMaxLength(model));
    promptService.prompt('prompt',
                         'Set charge max length :',
                         value)
      .then(function(value) {
        value = (value === 0) ? null : value;
        gameService.executeCommand('onModels', 'setChargeMaxLength', value,
                                   stamps, scope, scope.game);
        return value;
      })
      .catch(function(error) {
        gameService.executeCommand('onModels', 'setChargeMaxLength', null,
                                   stamps, scope, scope.game);
        return null;
      });
  };
  models_actions.toggleLeaderDisplay = function modelToggleLeaderDisplay(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    var model = gameModelsService.findStamp(stamps[0], scope.game.models);
    var present = modelService.isLeaderDisplayed(model);
    gameService.executeCommand('onModels', 'setLeaderDisplay', !present,
                               stamps, scope, scope.game);
  };
  models_actions.toggleIncorporealDisplay = function modelToggleIncorporealDisplay(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    var model = gameModelsService.findStamp(stamps[0], scope.game.models);
    var present = modelService.isIncorporealDisplayed(model);
    gameService.executeCommand('onModels', 'setIncorporealDisplay', !present,
                               stamps, scope, scope.game);
  };
  models_actions.toggleCtrlAreaDisplay = function modelToggleCtrlAreaDisplay(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    var model = gameModelsService.findStamp(stamps[0], scope.game.models);
    var present = modelService.isCtrlAreaDisplayed(scope.factions, model);
    gameService.executeCommand('onModels', 'setCtrlAreaDisplay', !present,
                               stamps, scope, scope.game);
  };
  var auras = [
    [ 'Red', '#F00' ],
    [ 'Green', '#0F0' ],
    [ 'Blue', '#00F' ],
    [ 'Yellow', '#FF0' ],
    [ 'Purple', '#F0F' ],
    [ 'Cyan', '#0FF' ],
  ];
  R.forEach(function(aura) {
    models_actions['toggle'+aura[0]+'AuraDisplay'] = function modelToggleAuraDisplay(scope) {
      var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
      var model = gameModelsService.findStamp(stamps[0], scope.game.models);
      var present = modelService.auraDisplay(model);
      gameService.executeCommand('onModels', 'setAuraDisplay',
                                 (present === aura[1]) ? null : aura[1],
                                 stamps, scope, scope.game);
    };
  }, auras);
  var areas = R.range(0, 10);
  R.forEach(function(area) {
    var size = area === 0 ? 10 : area;
    models_actions['toggle'+size+'InchesAreaDisplay'] = function modelToggleAreaDisplay(scope) {
      var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
      var model = gameModelsService.findStamp(stamps[0], scope.game.models);
      var present = modelService.areaDisplay(model);
      gameService.executeCommand('onModels', 'setAreaDisplay',
                                 (present === size) ? null : size,
                                 stamps, scope, scope.game);
    };
    var big_size = size + 10;
    models_actions['toggle'+big_size+'InchesAreaDisplay'] =
      function modelToggle10InchesAreaDisplay(scope) {
        var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
        var model = gameModelsService.findStamp(stamps[0], scope.game.models);
        var present = modelService.areaDisplay(model);
        gameService.executeCommand('onModels', 'setAreaDisplay',
                                   (present === big_size) ? null : big_size,
                                   stamps, scope, scope.game);
      };
  }, areas);
  var effects = [
    [ 'Blind', 'b' ],
    [ 'Corrosion', 'c' ],
    [ 'Disrupt', 'd' ],
    [ 'Fire', 'f' ],
    [ 'Fleeing', 'r' ],
    [ 'KD', 'k' ],
    [ 'Stationary', 's' ],
  ];
  R.forEach(function(effect) {
    models_actions['toggle'+effect[0]+'EffectDisplay'] = function modelToggleEffectDisplay(scope) {
      var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
      var model = gameModelsService.findStamp(stamps[0], scope.game.models);
      var present = modelService.isEffectDisplayed(effect[1], model);
      gameService.executeCommand('onModels', 'setEffectDisplay', effect[1], !present,
                                 stamps, scope, scope.game);
    };
  }, effects);
  // models_actions.lock = function modelsLock(scope) {
  //   var stamp = gameModelsSelectionService.get('local', scope.game.models_selection);
  //   gameService.executeCommand('lockModelss', [stamp], true, scope, scope.game);
  //   modesService.switchToMode(gameModelssService.modeForStamp(stamp, scope.game.modelss),
  //                             scope, scope.modes);
  // };
  var moves = [
    ['moveFront', 'up'],
    ['moveBack', 'down'],
    ['rotateLeft', 'left'],
    ['rotateRight', 'right'],
  ];
  R.forEach(function(move) {
    models_actions[move[0]] = function modelsMove(scope) {
      var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
      gameService.executeCommand('onModels', move[0], scope.factions, false,
                                 stamps, scope, scope.game);
    };
    models_actions[move[0]+'Small'] = function modelsMoveSmall(scope) {
      var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
      gameService.executeCommand('onModels', move[0], scope.factions, true,
                                 stamps, scope, scope.game);
    };
  }, moves);
  var shifts = [
    ['shiftUp', 'ctrl+up', 'shiftDown'],
    ['shiftDown', 'ctrl+down', 'shiftUp'],
    ['shiftLeft', 'ctrl+left', 'shiftRight'],
    ['shiftRight', 'ctrl+right', 'shiftLeft'],
  ];
  R.forEach(function(shift) {
    models_actions[shift[0]] = function modelsShift(scope) {
      var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
      var model_shift = R.path(['ui_state', 'flip_map'], scope) ? shift[2] : shift[0];
      gameService.executeCommand('onModels', model_shift, scope.factions, false,
                                 stamps, scope, scope.game);
    };
    models_actions[shift[0]+'Small'] = function modelsShiftSmall(scope) {
      var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
      var model_shift = R.path(['ui_state', 'flip_map'], scope) ? shift[2] : shift[0];
      gameService.executeCommand('onModels', model_shift, scope.factions, true,
                                 stamps, scope, scope.game);
    };
  }, shifts);
  models_actions.setOrientationUp = function modelSetOrientationUp(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    var orientation = scope.ui_state.flip_map ? 180 : 0;
    gameService.executeCommand('onModels', 'setOrientation', scope.factions, orientation,
                               stamps, scope, scope.game);
  };
  models_actions.setOrientationDown = function modelSetOrientationDown(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    var orientation = scope.ui_state.flip_map ? 0 : 180;
    gameService.executeCommand('onModels', 'setOrientation', scope.factions, orientation,
                               stamps, scope, scope.game);
  };

  (function() {
    var drag_models_start_states;
    var drag_models_start_selection;
    models_actions.dragStartModel = function modelsDragStartModel(scope, event) {
      var stamp = event.target.state.stamp;
      if(!gameModelSelectionService.in('local', stamp, scope.game.model_selection)) {
        gameService.executeCommand('setModelSelection', 'set', [stamp],
                                   scope, scope.game);
      }

      drag_models_start_selection = R.pipe(
        gameModelSelectionService.get$('local'),
        R.map(function(stamp) {
          return gameModelsService.findStamp(stamp, scope.game.models);
        })
      )(scope.game.model_selection);
      drag_models_start_states = R.map(modelService.saveState, drag_models_start_selection);

      models_actions.dragModel(scope, event);
    };
    models_actions.dragModel = function modelsDragModel(scope, event) {
      R.pipe(
        R.forEachIndexed(function(model, index) {
          var pos = {
            x: drag_models_start_states[index].x + event.now.x - event.start.x,
            y: drag_models_start_states[index].y + event.now.y - event.start.y,
          };
          modelService.setPosition(scope.factions, pos, model);
        }),
        R.forEach(function(model) {
          scope.gameEvent('changeModel-'+modelService.eventName(model));
        })
      )(drag_models_start_selection);
    };
    models_actions.dragEndModel = function modelsDragEndModel(scope, event) {
      R.pipe(
        R.forEachIndexed(function(model, index) {
          modelService.setPosition(scope.factions, drag_models_start_states[index], model);
        })
      )(drag_models_start_selection);
      var stamps = R.map(R.path(['state','stamp']), drag_models_start_selection);
      var shift = {
        x: event.now.x - event.start.x,
        y: event.now.y - event.start.y,
      };
      gameService.executeCommand('onModels', 'shiftPosition', scope.factions, shift,
                                 stamps, scope, scope.game);
    };
  })();

  var models_default_bindings = {
    'deleteSelection': 'del',
    'toggleImageDisplay': 'i',
    'setNextImage': 'shift+i',
    'setOrientationUp': 'pageup',
    'setOrientationDown': 'pagedown',
    'toggleCounterDisplay': 'n',
    'incrementCounter': '+',
    'decrementCounter': '-',
    'toggleSoulsDisplay': 'shift+s',
    'incrementSouls': 'shift++',
    'decrementSouls': 'shift+-',
    'toggleLeaderDisplay': 'alt+l',
    'toggleCtrlAreaDisplay': 'shift+c',
    'setRulerMaxLength': 'shift+m',
    'setChargeMaxLength': 'alt+m',
    'toggleMeleeDisplay': 'm',
    'toggleReachDisplay': 'r',
    'toggleStrikeDisplay': 's',
    'setUnit': 'shift+u',
    'toggleWreckDisplay': 'alt+w',
    'toggleUnitDisplay': 'alt+u',
  };
  R.forEach(function(move) {
    models_default_bindings[move[0]] = move[1];
    models_default_bindings[move[0]+'Small'] = 'shift+'+move[1];
  }, moves);
  R.forEach(function(shift) {
    models_default_bindings[shift[0]] = shift[1];
    models_default_bindings[shift[0]+'Small'] = 'shift+'+shift[1];
  }, shifts);
  R.forEach(function(area) {
    var size = area === 0 ? 10 : area;
    models_default_bindings['toggle'+size+'InchesAreaDisplay'] = 'alt+'+area;
    size += 10;
    models_default_bindings['toggle'+size+'InchesAreaDisplay'] = 'alt+shift+'+area;
  }, areas);
  R.forEachIndexed(function(aura, index) {
    models_default_bindings['toggle'+aura[0]+'AuraDisplay'] = 'ctrl+'+(index+1);
  }, auras);
  R.forEach(function(effect) {
    models_default_bindings['toggle'+effect[0]+'EffectDisplay'] = 'alt+'+effect[1];
  }, effects);
  models_default_bindings['toggleIncorporealDisplay'] = 'alt+i';
  var models_bindings = R.extend(Object.create(defaultModeService.bindings),
                                 models_default_bindings);
  var models_buttons = [
    [ 'Delete', 'deleteSelection' ],
    [ 'Ruler Max Len.', 'setRulerMaxLength' ],
    [ 'Charge Max Len.', 'setChargeMaxLength' ],
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
    [ 'Unit', 'toggle', 'unit' ],
    [ 'Show/Hide', 'toggleUnitDisplay', 'unit' ],
    [ 'Set #', 'setUnit', 'unit' ],
    [ 'Leader', 'toggleLeaderDisplay', 'unit' ],
    [ 'Melee', 'toggle', 'melee' ],
    [ '0.5"', 'toggleMeleeDisplay', 'melee' ],
    [ 'Reach', 'toggleReachDisplay', 'melee' ],
    [ 'Strike', 'toggleStrikeDisplay', 'melee' ],
  ];
  models_buttons = R.append([ 'Areas', 'toggle', 'areas' ], models_buttons);
  models_buttons = R.append([ 'CtrlArea', 'toggleCtrlAreaDisplay', 'areas' ], models_buttons);
  R.forEach(function(area) {
    var size = area + 1;
    models_buttons = R.append([ size+'"', 'toggle'+size+'InchesAreaDisplay', 'areas' ],
                              models_buttons);
  }, areas);
  R.forEach(function(area) {
    var size = area + 11;
    models_buttons = R.append([ size+'"', 'toggle'+size+'InchesAreaDisplay', 'areas' ],
                              models_buttons);
  }, areas);
  models_buttons = R.append([ 'Auras', 'toggle', 'auras' ], models_buttons);
  R.forEach(function(aura) {
    models_buttons = R.append([ aura[0], 'toggle'+aura[0]+'AuraDisplay', 'auras' ],
                              models_buttons);
  }, auras);
  models_buttons = R.append([ 'Effects', 'toggle', 'effects' ], models_buttons);
  R.forEach(function(effect) {
    models_buttons = R.append([ effect[0], 'toggle'+effect[0]+'EffectDisplay', 'effects' ],
                              models_buttons);
  }, effects);
  models_buttons = R.append([ 'Incorp.', 'toggleIncorporealDisplay', 'effects' ],
                            models_buttons);
  var models_mode = {
    onEnter: function modelsOnEnter(scope) {
    },
    onLeave: function modelsOnLeave(scope) {
    },
    name: 'Models',
    actions: models_actions,
    buttons: models_buttons,
    bindings: models_bindings,
    areas: areas,
    auras: auras,
    effects: effects,
  };
  modesService.registerMode(models_mode);
  settingsService.register('Bindings',
                           models_mode.name,
                           models_default_bindings,
                           function(bs) {
                             R.extend(models_mode.bindings, bs);
                           });
  return models_mode;
};
