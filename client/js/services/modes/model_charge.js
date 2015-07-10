'use strict';

self.modelChargeModeServiceFactory = function modelChargeModeServiceFactory(modesService,
                                                                            settingsService,
                                                                            modelsModeService,
                                                                            modelBaseModeService,
                                                                            modelService,
                                                                            gameService,
                                                                            gameModelsService,
                                                                            gameModelSelectionService) {
  var model_actions = Object.create(modelBaseModeService.actions);
  model_actions.endCharge = function modelEndCharge(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    gameService.executeCommand('onModels', 'endCharge',
                               stamps, scope, scope.game);
    modesService.switchToMode('Model', scope, scope.modes);
  };
  model_actions.clickModel = function modelClickModel(scope, event, dom_event) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    var model = gameModelsService.findStamp(stamps[0], scope.game.models);
    if(dom_event.shiftKey &&
       !dom_event.ctrlKey &&
       model.state.stamp !== event.target.state.stamp) {
      gameService.executeCommand('onModels', 'setChargeTarget',
                                 scope.factions, event.target,
                                 stamps, scope, scope.game);
      return;
    }
    modelBaseModeService.actions.clickModel(scope, event, dom_event);
  };
  var moves = [
    ['moveFront', 'up', 'moveFront'],
    ['moveBack', 'down', 'moveBack'],
    ['rotateLeft', 'left', 'rotateLeft'],
    ['rotateRight', 'right', 'rotateRight'],
    ['shiftUp', 'ctrl+up', 'shiftDown'],
    ['shiftDown', 'ctrl+down', 'shiftUp'],
    ['shiftLeft', 'ctrl+left', 'shiftRight'],
    ['shiftRight', 'ctrl+right', 'shiftLeft'],
  ];
  R.forEach(function(move) {
    model_actions[move[0]] = buildChargeMove(move[0], move[2], false,
                                             move[0]);
    model_actions[move[0]+'Small'] = buildChargeMove(move[0], move[2], true,
                                                     move[0]+'Small');
  }, moves);
  function buildChargeMove(move, flip_move, small, fwd) {
    return function modelDoChargeMove(scope) {
      var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
      var model = gameModelsService.findStamp(stamps[0], scope.game.models);
      var _move = move;
      if(R.path(['ui_state','flip_map'], scope)) _move = flip_move;

      var target = modelService.chargeTarget(model);
      var target_model;
      if(R.exists(target)) {
        target_model = gameModelsService.findStamp(target, scope.game.models);
      }
      gameService.executeCommand('onModels', _move+'Charge',
                                 scope.factions, target_model, small,
                                 stamps, scope, scope.game);
    };
  }

  var model_default_bindings = {
    'endCharge': 'c',
  };
  var model_bindings = R.extend(Object.create(modelBaseModeService.bindings),
                                model_default_bindings);
  var model_buttons = modelsModeService.buildButtons({ single: true,
                                                       end_charge: true });
  var model_mode = {
    onEnter: function modelOnEnter(scope) {
    },
    onLeave: function modelOnLeave(scope) {
    },
    name: 'ModelCharge',
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
