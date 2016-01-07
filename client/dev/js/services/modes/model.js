'use strict';

angular.module('clickApp.services').factory('modelMode', ['modes', 'settings', 'modelsMode', 'modelBaseMode', 'model', 'game', 'gameModels', 'gameModelSelection', function modelModeServiceFactory(modesService, settingsService, modelsModeService, modelBaseModeService, modelService, gameService, gameModelsService, gameModelSelectionService) {
  var model_actions = Object.create(modelBaseModeService.actions);
  model_actions.startCharge = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return R.pipePromise(function () {
      return state.event('Game.command.execute', 'onModels', ['startCharge', [], stamps]);
    }, function () {
      return state.event('Modes.switchTo', 'ModelCharge');
    })();
  };
  model_actions.startPlace = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return R.pipePromise(function () {
      return state.event('Game.command.execute', 'onModels', ['startPlace', [], stamps]);
    }, function () {
      return state.event('Modes.switchTo', 'ModelPlace');
    })();
  };

  var model_default_bindings = {
    'startCharge': 'c',
    'startPlace': 'p'
  };
  var model_bindings = R.extend(Object.create(modelBaseModeService.bindings), model_default_bindings);
  var model_buttons = modelsModeService.buildButtons({ single: true,
    start_charge: true,
    start_place: true
  });
  var model_mode = {
    onEnter: function onEnter() {},
    onLeave: function onLeave() {},
    name: 'Model',
    actions: model_actions,
    buttons: model_buttons,
    bindings: model_bindings
  };
  modesService.registerMode(model_mode);
  settingsService.register('Bindings', model_mode.name, model_default_bindings, function (bs) {
    R.extend(model_mode.bindings, bs);
  });
  return model_mode;
}]);
//# sourceMappingURL=model.js.map
