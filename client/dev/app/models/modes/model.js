'use strict';

(function () {
  angular.module('clickApp.services').factory('modelMode', modelModeModelFactory);

  modelModeModelFactory.$inject = ['appState', 'modes', 'settings', 'modelsMode', 'modelBaseMode', 'gameModelSelection'];
  function modelModeModelFactory(appStateService, modesModel, settingsModel, modelsModeModel, modelBaseModeModel, gameModelSelectionModel) {
    var model_actions = Object.create(modelBaseModeModel.actions);
    model_actions.startCharge = modelStartCharge;
    // model_actions.startPlace = modelStartPlace;

    var model_default_bindings = {
      'startCharge': 'c',
      'startPlace': 'p'
    };
    var model_bindings = R.extend(Object.create(modelBaseModeModel.bindings), model_default_bindings);
    var model_buttons = modelsModeModel.buildButtons({ single: true,
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
    modesModel.registerMode(model_mode);
    settingsModel.register('Bindings', model_mode.name, model_default_bindings, function (bs) {
      R.extend(model_mode.bindings, bs);
    });
    return model_mode;

    function modelStartCharge(state) {
      var stamps = gameModelSelectionModel.get('local', state.game.model_selection);
      appStateService.chainReduce('Game.command.execute', 'onModels', ['startChargeP', [], stamps]);
      appStateService.chainReduce('Modes.switchTo', 'ModelCharge');
    }
    // function modelStartPlace(state) {
    //   const stamps = gameModelSelectionModel
    //           .get('local', state.game.model_selection);
    //   return R.threadP()(
    //     () => state.eventP('Game.command.execute',
    //                        'onModels',
    //                        [ 'startPlaceP', [], stamps]),
    //     () => state.eventP('Modes.switchTo', 'ModelPlace')
    //   );
    // }
  }
})();
//# sourceMappingURL=model.js.map
