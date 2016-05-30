(function() {
  angular.module('clickApp.services')
    .factory('modelMode', modelModeModelFactory);

  modelModeModelFactory.$inject = [
    'appAction',
    'appState',
    'modes',
    'settings',
    'modelsMode',
    'modelBaseMode',
    'gameModelSelection',
  ];
  function modelModeModelFactory(appActionService,
                                 appStateService,
                                 modesModel,
                                 settingsModel,
                                 modelsModeModel,
                                 modelBaseModeModel,
                                 gameModelSelectionModel) {
    const model_actions = Object.create(modelBaseModeModel.actions);
    model_actions.startCharge = modelStartCharge;
    model_actions.startPlace = modelStartPlace;

    const model_default_bindings = {
      'startCharge': 'c',
      'startPlace': 'p'
    };
    const model_bindings = R.extend(Object.create(modelBaseModeModel.bindings),
                                  model_default_bindings);
    const model_buttons = modelsModeModel
          .buildButtons({ single: true,
                          start_charge: true,
                          start_place: true
                        });
    const model_mode = {
      onEnter: () => { },
      onLeave: () => { },
      name: 'Model',
      actions: model_actions,
      buttons: model_buttons,
      bindings: model_bindings
    };
    modesModel.registerMode(model_mode);
    settingsModel.register('Bindings',
                           model_mode.name,
                           model_default_bindings,
                           (bs) => {
                             R.extend(model_mode.bindings, bs);
                           });
    return model_mode;

    function modelStartCharge(state) {
      const stamps = gameModelSelectionModel
              .get('local', state.game.model_selection);
      appActionService
        .defer('Game.command.execute',
               'onModels',
               ['startChargeP', [], stamps]);
      return appStateService
        .onAction(state, ['Modes.switchTo', 'ModelCharge']);
    }
    function modelStartPlace(state) {
      const stamps = gameModelSelectionModel
              .get('local', state.game.model_selection);
      appActionService
        .defer('Game.command.execute',
               'onModels',
               [ 'startPlaceP', [], stamps]);
      return appStateService
        .onAction(state, ['Modes.switchTo', 'ModelPlace']);
    }
  }
})();
