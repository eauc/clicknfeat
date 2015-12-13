'use strict';

angular.module('clickApp.services').factory('modelsMode', ['modes', 'settings', 'defaultMode', 'model', 'game', 'gameModels', 'gameModelSelection', 'point', 'prompt', function modelsModeServiceFactory(modesService, settingsService, defaultModeService, modelService, gameService, gameModelsService, gameModelSelectionService, pointService, promptService) {
  var models_actions = Object.create(defaultModeService.actions);
  function modelsClearSelection(scope) {
    return gameService.executeCommand('setModelSelection', 'clear', null, scope, scope.game);
  }
  models_actions.clickMap = modelsClearSelection;
  models_actions.rightClickMap = modelsClearSelection;
  models_actions.modeBackToDefault = modelsClearSelection;
  models_actions.deleteSelection = function modelsDeleteSelection(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    return gameService.executeCommand('deleteModel', stamps, scope, scope.game);
  };
  models_actions.toggleLock = function modelsToggleLock(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.isLocked, function (present) {
      return gameService.executeCommand('lockModels', !present, stamps, scope, scope.game);
    })(scope.game.models);
  };
  models_actions.toggleImageDisplay = function modelsToggleImageDisplay(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.isImageDisplayed, function (present) {
      return gameService.executeCommand('onModels', 'setImageDisplay', !present, stamps, scope, scope.game);
    })(scope.game.models);
  };
  models_actions.setNextImage = function modelsSetNextImage(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    return gameService.executeCommand('onModels', 'setNextImage', scope.factions, stamps, scope, scope.game);
  };
  models_actions.toggleWreckDisplay = function modelsToggleWreckDisplay(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.isWreckDisplayed, function (present) {
      return gameService.executeCommand('onModels', 'setWreckDisplay', !present, stamps, scope, scope.game);
    })(scope.game.models);
  };
  models_actions.toggleUnitDisplay = function modelsToggleUnitDisplay(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.isUnitDisplayed, function (present) {
      return gameService.executeCommand('onModels', 'setUnitDisplay', !present, stamps, scope, scope.game);
    })(scope.game.models);
  };
  models_actions.setUnit = function modelsSetUnit(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), function (model) {
      var value = R.defaultTo(0, modelService.unit(model));

      return promptService.prompt('prompt', 'Set unit number :', value).catch(R.always(null));
    }, function (value) {
      return gameService.executeCommand('onModels', 'setUnit', value, stamps, scope, scope.game);
    })(scope.game.models);
  };
  models_actions.toggleMeleeDisplay = function modelsToggleMeleeDisplay(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.isMeleeDisplayed$('mm'), function (present) {
      return gameService.executeCommand('onModels', 'setMeleeDisplay', 'mm', !present, stamps, scope, scope.game);
    })(scope.game.models);
  };
  models_actions.toggleReachDisplay = function modelsToggleReachDisplay(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.isMeleeDisplayed$('mr'), function (present) {
      return gameService.executeCommand('onModels', 'setMeleeDisplay', 'mr', !present, stamps, scope, scope.game);
    })(scope.game.models);
  };
  models_actions.toggleStrikeDisplay = function modelsToggleStrikeDisplay(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.isMeleeDisplayed$('ms'), function (present) {
      return gameService.executeCommand('onModels', 'setMeleeDisplay', 'ms', !present, stamps, scope, scope.game);
    })(scope.game.models);
  };
  models_actions.toggleCounterDisplay = function modelsToggleCounterDisplay(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.isCounterDisplayed$('c'), function (present) {
      return gameService.executeCommand('onModels', 'setCounterDisplay', 'c', !present, stamps, scope, scope.game);
    })(scope.game.models);
  };
  models_actions.incrementCounter = function modelsIncrementCounter(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    return gameService.executeCommand('onModels', 'incrementCounter', 'c', stamps, scope, scope.game);
  };
  models_actions.decrementCounter = function modelsDecrementCounter(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    return gameService.executeCommand('onModels', 'decrementCounter', 'c', stamps, scope, scope.game);
  };
  models_actions.toggleSoulsDisplay = function modelsToggleSoulsDisplay(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.isCounterDisplayed$('s'), function (present) {
      return gameService.executeCommand('onModels', 'setCounterDisplay', 's', !present, stamps, scope, scope.game);
    })(scope.game.models);
  };
  models_actions.incrementSouls = function modelsIncrementSouls(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    return gameService.executeCommand('onModels', 'incrementCounter', 's', stamps, scope, scope.game);
  };
  models_actions.decrementSouls = function modelsDecrementSouls(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    return gameService.executeCommand('onModels', 'decrementCounter', 's', stamps, scope, scope.game);
  };
  models_actions.setRulerMaxLength = function modelsSetRulerMaxLength(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.rulerMaxLength, R.defaultTo(0), function (value) {
      return promptService.prompt('prompt', 'Set ruler max length :', value).catch(R.always(null));
    }, function (value) {
      value = value === 0 ? null : value;

      return gameService.executeCommand('onModels', 'setRulerMaxLength', value, stamps, scope, scope.game);
    })(scope.game.models);
  };
  models_actions.setChargeMaxLength = function modelsSetChargeMaxLength(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.chargeMaxLength, function (value) {
      return promptService.prompt('prompt', 'Set charge max length :', value).catch(R.always(null));
    }, function (value) {
      value = value === 0 ? null : value;

      return gameService.executeCommand('onModels', 'setChargeMaxLength', scope.factions, value, stamps, scope, scope.game);
    })(scope.game.models);
  };
  models_actions.setPlaceMaxLength = function modelsSetPlaceMaxLength(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.placeMaxLength, R.defaultTo(0), function (value) {
      return promptService.prompt('prompt', 'Set place max length :', value).catch(R.always(null));
    }, function (value) {
      value = value === 0 ? null : value;

      return gameService.executeCommand('onModels', 'setPlaceMaxLength', scope.factions, value, stamps, scope, scope.game);
    })(scope.game.models);
  };
  models_actions.togglePlaceWithin = function modelsTogglePlaceWithin(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.placeWithin, function (present) {
      return gameService.executeCommand('onModels', 'setPlaceWithin', scope.factions, !present, stamps, scope, scope.game);
    })(scope.game.models);
  };
  models_actions.toggleLeaderDisplay = function modelsToggleLeaderDisplay(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.isLeaderDisplayed, function (present) {
      return gameService.executeCommand('onModels', 'setLeaderDisplay', !present, stamps, scope, scope.game);
    })(scope.game.models);
  };
  models_actions.toggleIncorporealDisplay = function modelsToggleIncorporealDisplay(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.isIncorporealDisplayed, function (present) {
      return gameService.executeCommand('onModels', 'setIncorporealDisplay', !present, stamps, scope, scope.game);
    })(scope.game.models);
  };
  var effects = [['Blind', 'b'], ['Corrosion', 'c'], ['Disrupt', 'd'], ['Fire', 'f'], ['Fleeing', 'r'], ['KD', 'k'], ['Stationary', 's']];
  R.forEach(function (effect) {
    models_actions['toggle' + effect[0] + 'EffectDisplay'] = function modelsToggleEffectDisplay(scope) {
      var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
      return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.isEffectDisplayed$(effect[1]), function (present) {
        return gameService.executeCommand('onModels', 'setEffectDisplay', effect[1], !present, stamps, scope, scope.game);
      })(scope.game.models);
    };
  }, effects);
  var auras = [['Red', '#F00'], ['Green', '#0F0'], ['Blue', '#00F'], ['Yellow', '#FF0'], ['Purple', '#F0F'], ['Cyan', '#0FF']];
  R.forEach(function (aura) {
    models_actions['toggle' + aura[0] + 'AuraDisplay'] = function modelsToggleAuraDisplay(scope) {
      var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
      return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.auraDisplay, function (present) {
        return gameService.executeCommand('onModels', 'setAuraDisplay', present === aura[1] ? null : aura[1], stamps, scope, scope.game);
      })(scope.game.models);
    };
  }, auras);
  models_actions.toggleCtrlAreaDisplay = function modelsToggleCtrlAreaDisplay(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.isCtrlAreaDisplayed$(scope.factions), function (present) {
      return gameService.executeCommand('onModels', 'setCtrlAreaDisplay', !present, stamps, scope, scope.game);
    })(scope.game.models);
  };
  var areas = R.range(0, 10);
  R.forEach(function (area) {
    var size = area === 0 ? 10 : area;
    models_actions['toggle' + size + 'InchesAreaDisplay'] = function modelsToggleAreaDisplay(scope) {
      var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
      return R.pipeP(gameModelsService.findStamp$(stamps[0]), function (model) {
        var present = modelService.areaDisplay(model);

        return gameService.executeCommand('onModels', 'setAreaDisplay', present === size ? null : size, stamps, scope, scope.game);
      })(scope.game.models);
    };
    var big_size = size + 10;
    models_actions['toggle' + big_size + 'InchesAreaDisplay'] = function modelsToggle10InchesAreaDisplay(scope) {
      var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
      return R.pipeP(gameModelsService.findStamp$(stamps[0]), function (model) {
        var present = modelService.areaDisplay(model);

        return gameService.executeCommand('onModels', 'setAreaDisplay', present === big_size ? null : big_size, stamps, scope, scope.game);
      })(scope.game.models);
    };
  }, areas);
  var moves = [['moveFront', 'up'], ['moveBack', 'down'], ['rotateLeft', 'left'], ['rotateRight', 'right']];
  R.forEach(function (move) {
    models_actions[move[0]] = function modelsMove(scope) {
      var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
      return gameService.executeCommand('onModels', move[0], scope.factions, false, stamps, scope, scope.game);
    };
    models_actions[move[0] + 'Small'] = function modelsMoveSmall(scope) {
      var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
      return gameService.executeCommand('onModels', move[0], scope.factions, true, stamps, scope, scope.game);
    };
  }, moves);
  var shifts = [['shiftUp', 'ctrl+up', 'shiftDown'], ['shiftDown', 'ctrl+down', 'shiftUp'], ['shiftLeft', 'ctrl+left', 'shiftRight'], ['shiftRight', 'ctrl+right', 'shiftLeft']];
  R.forEach(function (shift) {
    models_actions[shift[0]] = function modelsShift(scope) {
      var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
      var model_shift = R.path(['ui_state', 'flip_map'], scope) ? shift[2] : shift[0];
      return gameService.executeCommand('onModels', model_shift, scope.factions, false, stamps, scope, scope.game);
    };
    models_actions[shift[0] + 'Small'] = function modelsShiftSmall(scope) {
      var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
      var model_shift = R.path(['ui_state', 'flip_map'], scope) ? shift[2] : shift[0];
      return gameService.executeCommand('onModels', model_shift, scope.factions, true, stamps, scope, scope.game);
    };
  }, shifts);
  models_actions.setOrientationUp = function modelsSetOrientationUp(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    var orientation = scope.ui_state.flip_map ? 180 : 0;
    gameService.executeCommand('onModels', 'setOrientation', scope.factions, orientation, stamps, scope, scope.game);
  };
  models_actions.setOrientationDown = function modelsSetOrientationDown(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    var orientation = scope.ui_state.flip_map ? 0 : 180;
    gameService.executeCommand('onModels', 'setOrientation', scope.factions, orientation, stamps, scope, scope.game);
  };
  models_actions.setTargetModel = function modelsSetTargetModel(scope, event) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    return gameService.executeCommand('onModels', 'orientTo', scope.factions, event['click#'].target, stamps, scope, scope.game);
  };

  (function () {
    var drag_charge_target;
    var drag_models_start_states;
    var drag_models_start_selection;
    models_actions.dragStartModel = function modelsDragStartModel(scope, event) {
      var stamp = event.target.state.stamp;
      return R.pipeP(function () {
        if (gameModelSelectionService.in('local', stamp, scope.game.model_selection)) {
          return self.Promise.resolve();
        }
        return gameService.executeCommand('setModelSelection', 'set', [stamp], scope, scope.game);
      }, function () {
        return gameModelSelectionService.get('local', scope.game.model_selection);
      }, function (stamps) {
        return gameModelsService.findAnyStamps(stamps, scope.game.models);
      }, R.reject(R.isNil), function (models) {
        drag_charge_target = null;
        if (R.length(models) === 1) {
          R.pipeP(modelService.chargeTarget, function (target_stamp) {
            return gameModelsService.findStamp(target_stamp, scope.game.models);
          }, function (target_model) {
            drag_charge_target = target_model;
          })(models[0]);
        }
        return models;
      }, function (models) {
        drag_models_start_selection = models;

        return R.map(modelService.saveState, models);
      }, function (states) {
        drag_models_start_states = states;

        return models_actions.dragModel(scope, event);
      })();
    };
    defaultModeService.actions.dragStartModel = models_actions.dragStartModel;
    models_actions.dragModel = function modelsDragModel(scope, event) {
      return R.pipeP(R.bind(self.Promise.resolve, self.Promise), R.addIndex(R.map)(function (model, index) {
        var pos = {
          x: drag_models_start_states[index].x + event.now.x - event.start.x,
          y: drag_models_start_states[index].y + event.now.y - event.start.y
        };
        return modelService.setPosition(scope.factions, drag_charge_target, pos, model);
      }), R.bind(self.Promise.all, self.Promise), R.forEach(function (model) {
        scope.gameEvent('changeModel-' + modelService.eventName(model));
      }))(drag_models_start_selection);
    };
    models_actions.dragEndModel = function modelsDragEndModel(scope, event) {
      return R.pipeP(R.bind(self.Promise.resolve, self.Promise), R.addIndex(R.map)(function (model, index) {
        return modelService.setPosition(scope.factions, drag_charge_target, drag_models_start_states[index], model);
      }), R.bind(self.Promise.all, self.Promise), R.map(R.path(['state', 'stamp'])), function (stamps) {
        var shift = {
          x: event.now.x - event.start.x,
          y: event.now.y - event.start.y
        };
        return gameService.executeCommand('onModels', 'shiftPosition', scope.factions, drag_charge_target, shift, stamps, scope, scope.game);
      })(drag_models_start_selection);
    };
  })();

  models_actions.copySelection = function modelsCopySelection(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    return R.pipeP(gameModelsService.copyStamps$(stamps), function (copy) {
      scope.create.model = copy;
      return scope.doSwitchToMode('CreateModel');
    })(scope.game.models);
  };

  var models_default_bindings = {
    'clickMap': 'clickMap',
    'rightClickMap': 'rightClickMap',
    'deleteSelection': 'del',
    'copySelection': 'ctrl+c',
    'toggleLock': 'shift+l',
    'toggleImageDisplay': 'i',
    'setNextImage': 'shift+i',
    'toggleWreckDisplay': 'alt+w',
    'setOrientationUp': 'pageup',
    'setOrientationDown': 'pagedown',
    'setTargetModel': 'shift+clickModel',
    'toggleCounterDisplay': 'n',
    'incrementCounter': '+',
    'decrementCounter': '-',
    'toggleSoulsDisplay': 'shift+s',
    'incrementSouls': 'shift++',
    'decrementSouls': 'shift+-',
    'toggleCtrlAreaDisplay': 'shift+c',
    'setRulerMaxLength': 'alt+m',
    'setChargeMaxLength': 'shift+m',
    'setPlaceMaxLength': 'shift+p',
    'togglePlaceWithin': 'shift+w',
    'toggleMeleeDisplay': 'm',
    'toggleReachDisplay': 'r',
    'toggleStrikeDisplay': 's',
    'toggleUnitDisplay': 'alt+u',
    'setUnit': 'shift+u',
    'toggleLeaderDisplay': 'alt+l',
    'toggleIncorporealDisplay': 'alt+i'
  };
  R.forEach(function (move) {
    models_default_bindings[move[0]] = move[1];
    models_default_bindings[move[0] + 'Small'] = 'shift+' + move[1];
  }, moves);
  R.forEach(function (shift) {
    models_default_bindings[shift[0]] = shift[1];
    models_default_bindings[shift[0] + 'Small'] = 'shift+' + shift[1];
  }, shifts);
  R.forEach(function (area) {
    var size = area === 0 ? 10 : area;
    models_default_bindings['toggle' + size + 'InchesAreaDisplay'] = 'alt+' + area;
    size += 10;
    models_default_bindings['toggle' + size + 'InchesAreaDisplay'] = 'alt+shift+' + area;
  }, areas);
  R.addIndex(R.forEach)(function (aura, index) {
    models_default_bindings['toggle' + aura[0] + 'AuraDisplay'] = 'ctrl+' + (index + 1);
  }, auras);
  R.forEach(function (effect) {
    models_default_bindings['toggle' + effect[0] + 'EffectDisplay'] = 'alt+' + effect[1];
  }, effects);
  var models_bindings = R.extend(Object.create(defaultModeService.bindings), models_default_bindings);

  var models_buttons = buildModelsModesButtons();
  var models_mode = {
    onEnter: function modelsOnEnter() /*scope*/{},
    onLeave: function modelsOnLeave() /*scope*/{},
    name: 'Models',
    actions: models_actions,
    buttons: models_buttons,
    buildButtons: buildModelsModesButtons,
    bindings: models_bindings,
    areas: areas,
    // auras: auras,
    effects: effects
  };
  modesService.registerMode(models_mode);
  settingsService.register('Bindings', models_mode.name, models_default_bindings, function (bs) {
    R.extend(models_mode.bindings, bs);
  });

  function buildModelsModesButtons(options) {
    options = R.defaultTo({}, options);
    var ret = [['Delete', 'deleteSelection'], ['Copy', 'copySelection'], ['Lock', 'toggleLock'], ['Ruler Max Len.', 'setRulerMaxLength'], ['Image', 'toggle', 'image'], ['Show/Hide', 'toggleImageDisplay', 'image'], ['Next', 'setNextImage', 'image'], ['Wreck', 'toggleWreckDisplay', 'image'], ['Orient.', 'toggle', 'orientation'], ['Face Up', 'setOrientationUp', 'orientation'], ['Face Down', 'setOrientationDown', 'orientation'], ['Counter', 'toggle', 'counter'], ['Show/Hide', 'toggleCounterDisplay', 'counter'], ['Inc.', 'incrementCounter', 'counter'], ['Dec.', 'decrementCounter', 'counter'], ['Souls', 'toggle', 'souls'], ['Show/Hide', 'toggleSoulsDisplay', 'souls'], ['Inc.', 'incrementSouls', 'souls'], ['Dec.', 'decrementSouls', 'souls'], ['Melee', 'toggle', 'melee'], ['0.5"', 'toggleMeleeDisplay', 'melee'], ['Reach', 'toggleReachDisplay', 'melee'], ['Strike', 'toggleStrikeDisplay', 'melee']];
    if (R.prop('single', options)) {
      ret = R.concat(ret, [['Templates', 'toggle', 'templates'], ['AoE', 'createAoEOnModel', 'templates'], ['Spray', 'createSprayOnModel', 'templates']]);
    }
    ret = R.append(['Areas', 'toggle', 'areas'], ret);
    ret = R.append(['CtrlArea', 'toggleCtrlAreaDisplay', 'areas'], ret);
    ret = R.concat(ret, R.map(function (area) {
      var size = area + 1;
      return [size + '"', 'toggle' + size + 'InchesAreaDisplay', 'areas'];
    }, areas));
    ret = R.concat(ret, R.map(function (area) {
      var size = area + 11;
      return [size + '"', 'toggle' + size + 'InchesAreaDisplay', 'areas'];
    }, areas));
    ret = R.append(['Auras', 'toggle', 'auras'], ret);
    ret = R.concat(ret, R.map(function (aura) {
      return [aura[0], 'toggle' + aura[0] + 'AuraDisplay', 'auras'];
    }, auras));
    ret = R.append(['Effects', 'toggle', 'effects'], ret);
    ret = R.concat(ret, R.map(function (effect) {
      return [effect[0], 'toggle' + effect[0] + 'EffectDisplay', 'effects'];
    }, effects));
    ret = R.append(['Incorp.', 'toggleIncorporealDisplay', 'effects'], ret);
    ret = R.append(['Charge', 'toggle', 'charge'], ret);
    if (R.prop('start_charge', options)) {
      ret = R.append(['Start', 'startCharge', 'charge'], ret);
    }
    if (R.prop('end_charge', options)) {
      ret = R.append(['End', 'endCharge', 'charge'], ret);
    }
    ret = R.append(['Max Len.', 'setChargeMaxLength', 'charge'], ret);
    ret = R.append(['Place', 'toggle', 'place'], ret);
    if (R.prop('start_place', options)) {
      ret = R.append(['Start', 'startPlace', 'place'], ret);
    }
    if (R.prop('end_place', options)) {
      ret = R.append(['End', 'endPlace', 'place'], ret);
    }
    ret = R.append(['Max Len.', 'setPlaceMaxLength', 'place'], ret);
    ret = R.append(['Within', 'togglePlaceWithin', 'place'], ret);
    ret = R.concat(ret, [['Unit', 'toggle', 'unit'], ['Show/Hide', 'toggleUnitDisplay', 'unit'], ['Set #', 'setUnit', 'unit'], ['Leader', 'toggleLeaderDisplay', 'unit']]);
    if (R.prop('single', options)) {
      ret = R.append(['Select All', 'selectAllUnit', 'unit'], ret);
      ret = R.append(['Select Friends', 'selectAllFriendly'], ret);
    }

    return ret;
  }

  return models_mode;
}]);
//# sourceMappingURL=models.js.map
