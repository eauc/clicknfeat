'use strict';

self.modelModeServiceFactory = function modelModeServiceFactory(modesService,
                                                                settingsService,
                                                                modelsModeService,
                                                                sprayTemplateModeService,
                                                                modelService,
                                                                gameService,
                                                                gameModelsService,
                                                                gameModelSelectionService) {
  var model_actions = Object.create(modelsModeService.actions);
  model_actions.createAoEOnModel = function modelCreateAoEModel(scope, event) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    var model = gameModelsService.findStamp(stamps[0], scope.game.models);
    var position = R.pick(['x','y'], model.state);
    position.type = 'aoe';
    gameService.executeCommand('createTemplate', position,
                               scope, scope.game);
  };
  model_actions.createSprayOnModel = function modelCreateSprayModel(scope, event) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    var model = gameModelsService.findStamp(stamps[0], scope.game.models);
    var position = R.pick(['x','y'], model.state);
    position.type = 'spray';
    gameService.executeCommand('createTemplate', position,
                               scope, scope.game);
    // simulate ctrl-click on model in sprayTemplateMode
    sprayTemplateModeService.actions.clickModel(scope,
                                                { target: model },
                                                { ctrlKey: true });
  };
  model_actions.selectAllUnit = function modelSelectAllUnit(scope, event) {
    var selection = gameModelSelectionService.get('local', scope.game.model_selection);
    var model = gameModelsService.findStamp(selection[0], scope.game.models);
    var stamps = R.pipe(
      gameModelsService.all,
      R.filter(modelService.userIs$(modelService.user(model))),
      R.filter(modelService.unitIs$(modelService.unit(model))),
      R.map(modelService.stamp)
    )(scope.game.models);
    gameService.executeCommand('setModelSelection', 'set', stamps,
                               scope, scope.game);
  };
  model_actions.toggleCharge = function modelToggleCharge(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    var model = gameModelsService.findStamp(stamps[0], scope.game.models);
    if(modelService.isCharging(model)) {
      gameService.executeCommand('onModels', 'endCharge',
                                 stamps, scope, scope.game);
    }
    else {
      gameService.executeCommand('onModels', 'startCharge',
                                 stamps, scope, scope.game);
    }
  };
  model_actions.clickModel = function modelClickModel(scope, event, dom_event) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    var model = gameModelsService.findStamp(stamps[0], scope.game.models);
    if(dom_event.shiftKey &&
       modelService.isCharging(model) &&
       model.state.stamp !== event.target.state.stamp) {
      gameService.executeCommand('onModels', 'setChargeTarget',
                                 scope.factions, event.target,
                                 stamps, scope, scope.game);
      return;
    }
    modelsModeService.actions.clickModel(scope, event, dom_event);
  };
  var moves = [
    ['moveFront', 'up'],
    ['moveBack', 'down'],
    ['rotateLeft', 'left'],
    ['rotateRight', 'right'],
    ['shiftUp', 'ctrl+up'],
    ['shiftDown', 'ctrl+down'],
    ['shiftLeft', 'ctrl+left'],
    ['shiftRight', 'ctrl+right'],
  ];
  R.forEach(function(move) {
    model_actions[move[0]] = buildChargeMove(move[0], false, move[0]);
    model_actions[move[0]+'Small'] = buildChargeMove(move[0], true, move[0]+'Small');
  }, moves);
  function buildChargeMove(move, small, fwd) {
    return function modelDoChargeMove(scope) {
      var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
      var model = gameModelsService.findStamp(stamps[0], scope.game.models);
      if(modelService.isCharging(model)) {
        var target = modelService.chargeTarget(model);
        var target_model;
        if(R.exists(target)) {
          target_model = gameModelsService.findStamp(target, scope.game.models);
        }
        gameService.executeCommand('onModels', move+'Charge',
                                   scope.factions, target_model, small,
                                   stamps, scope, scope.game);
        return;
      }
      modelsModeService.actions[fwd](scope);
    };
  }
  // model_actions.delete = function modelDelete(scope) {
  //   var target = gameModelSelectionService.get('local', scope.game.model_selection);
  //   gameService.executeCommand('deleteModels', [target], scope, scope.game);
  // };
  // model_actions.lock = function modelLock(scope) {
  //   var stamp = gameModelSelectionService.get('local', scope.game.model_selection);
  //   gameService.executeCommand('lockModels', [stamp], true, scope, scope.game);
  //   modesService.switchToMode(gameModelsService.modeForStamp(stamp, scope.game.models),
  //                             scope, scope.modes);
  // };

  var model_default_bindings = {
    'createAoEOnModel': 'ctrl+a',
    'createSprayOnModel': 'ctrl+s',
    'selectAllUnit': 'ctrl+u',
    'toggleCharge': 'c',
  };
  var model_bindings = R.extend(Object.create(modelsModeService.bindings),
                                 model_default_bindings);
  var model_buttons = [
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
    [ 'Select All', 'selectAllUnit', 'unit' ],
    [ 'Set #', 'setUnit', 'unit' ],
    [ 'Leader', 'toggleLeaderDisplay', 'unit' ],
    [ 'Melee', 'toggle', 'melee' ],
    [ '0.5"', 'toggleMeleeDisplay', 'melee' ],
    [ 'Reach', 'toggleReachDisplay', 'melee' ],
    [ 'Strike', 'toggleStrikeDisplay', 'melee' ],
    [ 'Templates', 'toggle', 'templates' ],
    [ 'AoE', 'createAoEOnModel', 'templates' ],
    [ 'Spray', 'createSprayOnModel', 'templates' ],
    [ 'Charge', 'toggleCharge' ],
  ];
  model_buttons = R.append([ 'Areas', 'toggle', 'areas' ], model_buttons);
  model_buttons = R.append([ 'CtrlArea', 'toggleCtrlAreaDisplay', 'areas' ], model_buttons);
  R.forEach(function(area) {
    var size = area + 1;
    model_buttons = R.append([ size+'"', 'toggle'+size+'InchesAreaDisplay', 'areas' ],
                             model_buttons);
  }, modelsModeService.areas);
  R.forEach(function(area) {
    var size = area + 11;
    model_buttons = R.append([ size+'"', 'toggle'+size+'InchesAreaDisplay', 'areas' ],
                             model_buttons);
  }, modelsModeService.areas);
  model_buttons = R.append([ 'Auras', 'toggle', 'auras' ], model_buttons);
  R.forEach(function(aura) {
    model_buttons = R.append([ aura[0], 'toggle'+aura[0]+'AuraDisplay', 'auras' ],
                             model_buttons);
  }, modelsModeService.auras);
  model_buttons = R.append([ 'Effects', 'toggle', 'effects' ], model_buttons);
  R.forEach(function(effect) {
    model_buttons = R.append([ effect[0], 'toggle'+effect[0]+'EffectDisplay', 'effects' ],
                             model_buttons);
  }, modelsModeService.effects);
  var model_mode = {
    onEnter: function modelOnEnter(scope) {
    },
    onLeave: function modelOnLeave(scope) {
    },
    name: 'Model',
    actions: model_actions,
    buttons: model_buttons,
    bindings: model_bindings,
  };
  modesService.registerMode(model_mode);
  settingsService.register('Bindings',
                           model_mode.name,
                           model_default_bindings,
                           function(bs) {
                             R.extend(model_mode.bindings, bs);
                           });
  return model_mode;
};
