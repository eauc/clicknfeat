'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

angular.module('clickApp.services').factory('modelsMode', ['modes', 'settings', 'defaultMode', 'model', 'game', 'gameModels', 'gameModelSelection', 'point', 'prompt', function modelsModeServiceFactory(modesService, settingsService, defaultModeService, modelService, gameService, gameModelsService, gameModelSelectionService, pointService, promptService) {
  var models_actions = Object.create(defaultModeService.actions);
  function modelsClearSelection(state) {
    return state.event('Game.command.execute', 'setModelSelection', ['clear', null]);
  }
  models_actions.clickMap = modelsClearSelection;
  models_actions.rightClickMap = modelsClearSelection;
  models_actions.modeBackToDefault = modelsClearSelection;
  models_actions.deleteSelection = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return state.event('Game.command.execute', 'deleteModel', [stamps]);
  };
  models_actions.toggleLock = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.isLocked, function (present) {
      return state.event('Game.command.execute', 'lockModels', [!present, stamps]);
    })(state.game.models);
  };
  models_actions.toggleImageDisplay = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.isImageDisplayed, function (present) {
      return state.event('Game.command.execute', 'onModels', ['setImageDisplay', [!present], stamps]);
    })(state.game.models);
  };
  models_actions.setNextImage = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return state.event('Game.command.execute', 'onModels', ['setNextImage', [state.factions], stamps]);
  };
  models_actions.toggleWreckDisplay = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.isWreckDisplayed, function (present) {
      return state.event('Game.command.execute', 'onModels', ['setWreckDisplay', [!present], stamps]);
    })(state.game.models);
  };
  models_actions.toggleUnitDisplay = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.isUnitDisplayed, function (present) {
      return state.event('Game.command.execute', 'onModels', ['setUnitDisplay', [!present], stamps]);
    })(state.game.models);
  };
  models_actions.setUnit = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), function (model) {
      var value = R.defaultTo(0, modelService.unit(model));

      return promptService.prompt('prompt', 'Set unit number :', value).catch(R.always(null));
    }, function (value) {
      return state.event('Game.command.execute', 'onModels', ['setUnit', [value], stamps]);
    })(state.game.models);
  };
  models_actions.toggleMeleeDisplay = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.isMeleeDisplayed$('mm'), function (present) {
      return state.event('Game.command.execute', 'onModels', ['setMeleeDisplay', ['mm', !present], stamps]);
    })(state.game.models);
  };
  models_actions.toggleReachDisplay = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.isMeleeDisplayed$('mr'), function (present) {
      return state.event('Game.command.execute', 'onModels', ['setMeleeDisplay', ['mr', !present], stamps]);
    })(state.game.models);
  };
  models_actions.toggleStrikeDisplay = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.isMeleeDisplayed$('ms'), function (present) {
      return state.event('Game.command.execute', 'onModels', ['setMeleeDisplay', ['ms', !present], stamps]);
    })(state.game.models);
  };
  models_actions.toggleCounterDisplay = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.isCounterDisplayed$('c'), function (present) {
      return state.event('Game.command.execute', 'onModels', ['setCounterDisplay', ['c', !present], stamps]);
    })(state.game.models);
  };
  models_actions.incrementCounter = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return state.event('Game.command.execute', 'onModels', ['incrementCounter', ['c'], stamps]);
  };
  models_actions.decrementCounter = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return state.event('Game.command.execute', 'onModels', ['decrementCounter', ['c'], stamps]);
  };
  models_actions.toggleSoulsDisplay = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.isCounterDisplayed$('s'), function (present) {
      return state.event('Game.command.execute', 'onModels', ['setCounterDisplay', ['s', !present], stamps]);
    })(state.game.models);
  };
  models_actions.incrementSouls = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return state.event('Game.command.execute', 'onModels', ['incrementCounter', ['s'], stamps]);
  };
  models_actions.decrementSouls = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return state.event('Game.command.execute', 'onModels', ['decrementCounter', ['s'], stamps]);
  };
  models_actions.setRulerMaxLength = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.rulerMaxLength, R.defaultTo(0), function (value) {
      return promptService.prompt('prompt', 'Set ruler max length :', value).catch(R.always(null));
    }, function (value) {
      value = value === 0 ? null : value;

      return state.event('Game.command.execute', 'onModels', ['setRulerMaxLength', [value], stamps]);
    })(state.game.models);
  };
  models_actions.setChargeMaxLength = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.chargeMaxLength, function (value) {
      return promptService.prompt('prompt', 'Set charge max length :', value).catch(R.always(null));
    }, function (value) {
      value = value === 0 ? null : value;

      return state.event('Game.command.execute', 'onModels', ['setChargeMaxLength', [state.factions, value], stamps]);
    })(state.game.models);
  };
  models_actions.setPlaceMaxLength = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.placeMaxLength, R.defaultTo(0), function (value) {
      return promptService.prompt('prompt', 'Set place max length :', value).catch(R.always(null));
    }, function (value) {
      value = value === 0 ? null : value;

      return state.event('Game.command.execute', 'onModels', ['setPlaceMaxLength', [state.factions, value], stamps]);
    })(state.game.models);
  };
  models_actions.togglePlaceWithin = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.placeWithin, function (present) {
      return state.event('Game.command.execute', 'onModels', ['setPlaceWithin', [state.factions, !present], stamps]);
    })(state.game.models);
  };
  models_actions.toggleLeaderDisplay = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.isLeaderDisplayed, function (present) {
      return state.event('Game.command.execute', 'onModels', ['setLeaderDisplay', [!present], stamps]);
    })(state.game.models);
  };
  models_actions.toggleIncorporealDisplay = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.isIncorporealDisplayed, function (present) {
      return state.event('Game.command.execute', 'onModels', ['setIncorporealDisplay', [!present], stamps]);
    })(state.game.models);
  };
  var effects = [['Blind', 'b'], ['Corrosion', 'c'], ['Disrupt', 'd'], ['Fire', 'f'], ['Fleeing', 'e'], ['KD', 'k'], ['Stationary', 't']];
  R.forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var effect = _ref2[0];
    var flag = _ref2[1];

    models_actions['toggle' + effect + 'EffectDisplay'] = function (state) {
      var stamps = gameModelSelectionService.get('local', state.game.model_selection);
      return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.isEffectDisplayed$(flag), function (present) {
        return state.event('Game.command.execute', 'onModels', ['setEffectDisplay', [flag, !present], stamps]);
      })(state.game.models);
    };
  }, effects);
  var auras = [['Red', '#F00'], ['Green', '#0F0'], ['Blue', '#00F'], ['Yellow', '#FF0'], ['Purple', '#F0F'], ['Cyan', '#0FF']];
  R.forEach(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2);

    var aura = _ref4[0];
    var hex = _ref4[1];

    models_actions['toggle' + aura + 'AuraDisplay'] = function (state) {
      var stamps = gameModelSelectionService.get('local', state.game.model_selection);
      return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.auraDisplay, function (present) {
        return state.event('Game.command.execute', 'onModels', ['setAuraDisplay', [present === hex ? null : hex], stamps]);
      })(state.game.models);
    };
  }, auras);
  models_actions.toggleCtrlAreaDisplay = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), modelService.isCtrlAreaDisplayed$(state.factions), function (present) {
      return state.event('Game.command.execute', 'onModels', ['setCtrlAreaDisplay', [!present], stamps]);
    })(state.game.models);
  };
  var areas = R.range(0, 10);
  R.forEach(function (area) {
    var size = area === 0 ? 10 : area;
    models_actions['toggle' + size + 'InchesAreaDisplay'] = function (state) {
      var stamps = gameModelSelectionService.get('local', state.game.model_selection);
      return R.pipeP(gameModelsService.findStamp$(stamps[0]), function (model) {
        var present = modelService.areaDisplay(model);

        return state.event('Game.command.execute', 'onModels', ['setAreaDisplay', [present === size ? null : size], stamps]);
      })(state.game.models);
    };
    var big_size = size + 10;
    models_actions['toggle' + big_size + 'InchesAreaDisplay'] = function (state) {
      var stamps = gameModelSelectionService.get('local', state.game.model_selection);
      return R.pipeP(gameModelsService.findStamp$(stamps[0]), function (model) {
        var present = modelService.areaDisplay(model);

        return state.event('Game.command.execute', 'onModels', ['setAreaDisplay', [present === big_size ? null : big_size], stamps]);
      })(state.game.models);
    };
  }, areas);
  var moves = [['moveFront', 'up'], ['moveBack', 'down'], ['rotateLeft', 'left'], ['rotateRight', 'right']];
  R.forEach(function (_ref5) {
    var _ref6 = _slicedToArray(_ref5, 2);

    var move = _ref6[0];
    var key = _ref6[1];

    key = key;
    models_actions[move] = function (state) {
      var stamps = gameModelSelectionService.get('local', state.game.model_selection);
      return state.event('Game.command.execute', 'onModels', [move, [state.factions, false], stamps]);
    };
    models_actions[move + 'Small'] = function (state) {
      var stamps = gameModelSelectionService.get('local', state.game.model_selection);
      return state.event('Game.command.execute', 'onModels', [move, [state.factions, true], stamps]);
    };
  }, moves);
  var shifts = [['shiftUp', 'ctrl+up', 'shiftDown'], ['shiftDown', 'ctrl+down', 'shiftUp'], ['shiftLeft', 'ctrl+left', 'shiftRight'], ['shiftRight', 'ctrl+right', 'shiftLeft']];
  R.forEach(function (_ref7) {
    var _ref8 = _slicedToArray(_ref7, 3);

    var shift = _ref8[0];
    var key = _ref8[1];
    var flip_shift = _ref8[2];

    key = key;
    models_actions[shift] = function (state) {
      var stamps = gameModelSelectionService.get('local', state.game.model_selection);
      var model_shift = R.path(['ui_state', 'flip_map'], state) ? flip_shift : shift;
      return state.event('Game.command.execute', 'onModels', [model_shift, [state.factions, false], stamps]);
    };
    models_actions[shift + 'Small'] = function (state) {
      var stamps = gameModelSelectionService.get('local', state.game.model_selection);
      var model_shift = R.path(['ui_state', 'flip_map'], state) ? flip_shift : shift;
      return state.event('Game.command.execute', 'onModels', [model_shift, [state.factions, true], stamps]);
    };
  }, shifts);
  models_actions.setOrientationUp = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    var orientation = state.ui_state.flip_map ? 180 : 0;
    state.event('Game.command.execute', 'onModels', ['setOrientation', [state.factions, orientation], stamps]);
  };
  models_actions.setOrientationDown = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    var orientation = state.ui_state.flip_map ? 0 : 180;
    state.event('Game.command.execute', 'onModels', ['setOrientation', [state.factions, orientation], stamps]);
  };
  models_actions.setTargetModel = function (state, event) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return state.event('Game.command.execute', 'onModels', ['orientTo', [state.factions, event['click#'].target], stamps]);
  };

  (function () {
    var drag_charge_target = undefined;
    var drag_models_start_states = undefined;
    var drag_models_start_selection = undefined;
    models_actions.dragStartModel = function (state, event) {
      var stamp = event.target.state.stamp;
      return R.pipePromise(function () {
        var in_selection = gameModelSelectionService.in('local', stamp, state.game.model_selection);
        if (in_selection) return null;

        return state.event('Game.command.execute', 'setModelSelection', ['set', [stamp]]);
      }, function () {
        return gameModelSelectionService.get('local', state.game.model_selection);
      }, function (stamps) {
        return gameModelsService.findAnyStamps(stamps, state.game.models);
      }, R.reject(R.isNil), function (models) {
        drag_charge_target = null;
        if (R.length(models) === 1) {
          R.pipeP(modelService.chargeTarget, function (target_stamp) {
            return gameModelsService.findStamp(target_stamp, state.game.models);
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

        return models_actions.dragModel(state, event);
      })();
    };
    defaultModeService.actions.dragStartModel = models_actions.dragStartModel;
    models_actions.dragModel = function (state, event) {
      return R.pipePromise(R.addIndex(R.map)(function (model, index) {
        var pos = {
          x: drag_models_start_states[index].x + event.now.x - event.start.x,
          y: drag_models_start_states[index].y + event.now.y - event.start.y
        };
        return modelService.setPosition_(state.factions, drag_charge_target, pos, model);
      }), R.promiseAll, R.forEach(function (model) {
        state.changeEvent('Game.model.change.' + model.state.stamp);
      }))(drag_models_start_selection);
    };
    models_actions.dragEndModel = function (state, event) {
      return R.pipePromise(R.addIndex(R.map)(function (model, index) {
        return modelService.setPosition_(state.factions, drag_charge_target, drag_models_start_states[index], model);
      }), R.promiseAll, R.map(R.path(['state', 'stamp'])), function (stamps) {
        var shift = {
          x: event.now.x - event.start.x,
          y: event.now.y - event.start.y
        };
        return state.event('Game.command.execute', 'onModels', ['shiftPosition', [state.factions, drag_charge_target, shift], stamps]);
      })(drag_models_start_selection);
    };
  })();

  models_actions.copySelection = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return R.pipeP(gameModelsService.copyStamps$(stamps), function (copy) {
      return state.event('Game.model.copy', copy);
    })(state.game.models);
  };
  models_actions.clearLabel = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return state.event('Game.command.execute', 'onModels', ['clearLabel', [], stamps]);
  };

  var models_default_bindings = {
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
  R.forEach(function (_ref9) {
    var _ref10 = _slicedToArray(_ref9, 2);

    var move = _ref10[0];
    var keys = _ref10[1];

    models_default_bindings[move] = keys;
    models_default_bindings[move + 'Small'] = 'shift+' + keys;
  }, moves);
  R.forEach(function (_ref11) {
    var _ref12 = _slicedToArray(_ref11, 2);

    var shift = _ref12[0];
    var keys = _ref12[1];

    models_default_bindings[shift] = keys;
    models_default_bindings[shift + 'Small'] = 'shift+' + keys;
  }, shifts);
  R.forEach(function (area) {
    var size = area === 0 ? 10 : area;
    models_default_bindings['toggle' + size + 'InchesAreaDisplay'] = 'alt+' + area;
    size += 10;
    models_default_bindings['toggle' + size + 'InchesAreaDisplay'] = 'alt+shift+' + area;
  }, areas);
  R.addIndex(R.forEach)(function (_ref13, index) {
    var _ref14 = _slicedToArray(_ref13, 1);

    var aura = _ref14[0];

    models_default_bindings['toggle' + aura + 'AuraDisplay'] = 'ctrl+' + (index + 1);
  }, auras);
  R.forEach(function (_ref15) {
    var _ref16 = _slicedToArray(_ref15, 2);

    var effect = _ref16[0];
    var keys = _ref16[1];

    models_default_bindings['toggle' + effect + 'EffectDisplay'] = 'alt+' + keys;
  }, effects);
  var models_bindings = R.extend(Object.create(defaultModeService.bindings), models_default_bindings);

  var models_buttons = buildModelsModesButtons();
  var models_mode = {
    onEnter: function onEnter() {},
    onLeave: function onLeave() {},
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
  settingsService.register('Bindings', models_mode.name, models_default_bindings, function (bs) {
    R.extend(models_mode.bindings, bs);
  });

  function buildModelsModesButtons() {
    var _ref17 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var single = _ref17.single;
    var start_charge = _ref17.start_charge;
    var end_charge = _ref17.end_charge;
    var start_place = _ref17.start_place;
    var end_place = _ref17.end_place;

    var ret = [['Delete', 'deleteSelection'], ['Copy', 'copySelection'], ['Lock', 'toggleLock'], ['Ruler Max Len.', 'setRulerMaxLength'], ['Clear Label', 'clearLabel'], ['Image', 'toggle', 'image'], ['Show/Hide', 'toggleImageDisplay', 'image'], ['Next', 'setNextImage', 'image'], ['Wreck', 'toggleWreckDisplay', 'image'], ['Orient.', 'toggle', 'orientation'], ['Face Up', 'setOrientationUp', 'orientation'], ['Face Down', 'setOrientationDown', 'orientation'], ['Counter', 'toggle', 'counter'], ['Show/Hide', 'toggleCounterDisplay', 'counter'], ['Inc.', 'incrementCounter', 'counter'], ['Dec.', 'decrementCounter', 'counter'], ['Souls', 'toggle', 'souls'], ['Show/Hide', 'toggleSoulsDisplay', 'souls'], ['Inc.', 'incrementSouls', 'souls'], ['Dec.', 'decrementSouls', 'souls'], ['Melee', 'toggle', 'melee'], ['0.5"', 'toggleMeleeDisplay', 'melee'], ['Reach', 'toggleReachDisplay', 'melee'], ['Strike', 'toggleStrikeDisplay', 'melee']];
    if (single) {
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
    ret = R.concat(ret, R.map(function (_ref18) {
      var _ref19 = _slicedToArray(_ref18, 1);

      var aura = _ref19[0];

      return [aura, 'toggle' + aura + 'AuraDisplay', 'auras'];
    }, auras));
    ret = R.append(['Effects', 'toggle', 'effects'], ret);
    ret = R.concat(ret, R.map(function (_ref20) {
      var _ref21 = _slicedToArray(_ref20, 1);

      var effect = _ref21[0];

      return [effect, 'toggle' + effect + 'EffectDisplay', 'effects'];
    }, effects));
    ret = R.append(['Incorp.', 'toggleIncorporealDisplay', 'effects'], ret);
    ret = R.append(['Charge', 'toggle', 'charge'], ret);
    if (start_charge) {
      ret = R.append(['Start', 'startCharge', 'charge'], ret);
    }
    if (end_charge) {
      ret = R.append(['End', 'endCharge', 'charge'], ret);
    }
    ret = R.append(['Max Len.', 'setChargeMaxLength', 'charge'], ret);
    ret = R.append(['Place', 'toggle', 'place'], ret);
    if (start_place) {
      ret = R.append(['Start', 'startPlace', 'place'], ret);
    }
    if (end_place) {
      ret = R.append(['End', 'endPlace', 'place'], ret);
    }
    ret = R.append(['Max Len.', 'setPlaceMaxLength', 'place'], ret);
    ret = R.append(['Within', 'togglePlaceWithin', 'place'], ret);
    ret = R.concat(ret, [['Unit', 'toggle', 'unit'], ['Show/Hide', 'toggleUnitDisplay', 'unit'], ['Set #', 'setUnit', 'unit'], ['Leader', 'toggleLeaderDisplay', 'unit']]);
    if (single) {
      ret = R.append(['Select All', 'selectAllUnit', 'unit'], ret);
      ret = R.append(['Select Friends', 'selectAllFriendly'], ret);
    }

    return ret;
  }

  return models_mode;
}]);
//# sourceMappingURL=models.js.map
