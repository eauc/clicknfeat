'use strict';

self.modelModeServiceFactory = function modelModeServiceFactory(modesService,
                                                                settingsService,
                                                                modelsModeService,
                                                                modelBaseModeService,
                                                                modelService,
                                                                gameService,
                                                                gameModelsService,
                                                                gameModelSelectionService) {
  var model_actions = Object.create(modelBaseModeService.actions);
  model_actions.startCharge = function modelStartCharge(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    gameService.executeCommand('onModels', 'startCharge',
                               stamps, scope, scope.game);
    modesService.switchToMode('ModelCharge', scope, scope.modes);
  };
  model_actions.startPlace = function modelStartPlace(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    gameService.executeCommand('onModels', 'startPlace',
                               stamps, scope, scope.game);
    modesService.switchToMode('ModelPlace', scope, scope.modes);
  };
  model_actions.clickModel = function modelClickModel(scope, event, dom_event) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    var model = gameModelsService.findStamp(stamps[0], scope.game.models);
    if(dom_event.shiftKey &&
       !dom_event.ctrlKey &&
       model.state.stamp !== event.target.state.stamp) {
      gameService.executeCommand('onModels', 'orientTo',
                                 scope.factions, event.target,
                                 stamps, scope, scope.game);
      return;
    }
    modelBaseModeService.actions.clickModel(scope, event, dom_event);
  };

  var model_default_bindings = {
    'startCharge': 'c',
    'startPlace': 'p',
  };
  var model_bindings = R.extend(Object.create(modelBaseModeService.bindings),
                                model_default_bindings);
  var model_buttons = modelsModeService.buildButtons({ single: true,
                                                       start_charge: true,
                                                       start_place: true });
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
