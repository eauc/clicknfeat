'use strict';

angular.module('clickApp.services').factory('losMode', ['modes', 'settings', 'commonMode', 'game', 'gameLos', 'gameModels', 'gameModelSelection', function losModeServiceFactory(modesService, settingsService, commonModeService, gameService, gameLosService, gameModelsService, gameModelSelectionService) {
  var los_actions = Object.create(commonModeService.actions);
  los_actions.exitLosMode = commonModeService.actions.modeBackToDefault;
  los_actions.dragStartMap = function (state, drag) {
    return state.event('Game.update', R.lensProp('los'), gameLosService.setLocal$(drag.start, drag.now, state));
  };
  los_actions.dragMap = function (state, drag) {
    return state.event('Game.update', R.lensProp('los'), gameLosService.setLocal$(drag.start, drag.now, state));
  };
  los_actions.dragEndMap = function (state, drag) {
    return state.event('Game.command.execute', 'setLos', ['setRemote', [drag.start, drag.now]]);
  };
  los_actions.dragStartTemplate = los_actions.dragStartMap;
  los_actions.dragTemplate = los_actions.dragMap;
  los_actions.dragEndTemplate = los_actions.dragEndMap;
  los_actions.dragStartModel = los_actions.dragStartMap;
  los_actions.dragModel = los_actions.dragMap;
  los_actions.dragEndModel = los_actions.dragEndMap;
  los_actions.setOriginModel = function (state, event) {
    return state.event('Game.command.execute', 'setLos', ['setOrigin', [event['click#'].target]]);
  };
  los_actions.setTargetModel = function (state, event) {
    return state.event('Game.command.execute', 'setLos', ['setTarget', [event['click#'].target]]);
  };
  los_actions.toggleIgnoreModel = function (state, event) {
    return state.event('Game.command.execute', 'setLos', ['toggleIgnoreModel', [event['click#'].target]]);
  };
  var los_default_bindings = {
    exitLosMode: 'ctrl+l',
    toggleIgnoreModel: 'clickModel',
    setOriginModel: 'ctrl+clickModel',
    setTargetModel: 'shift+clickModel'
  };
  var los_bindings = R.extend(Object.create(commonModeService.bindings), los_default_bindings);
  var los_buttons = [];
  var los_mode = {
    onEnter: function onEnter(state) {
      return R.pipePromise(R.path(['game', 'model_selection']), gameModelSelectionService.get$('local'), function (stamps) {
        if (R.length(stamps) !== 1) return null;

        return gameModelsService.findStamp(stamps[0], state.game.models).catch(R.always(null));
      }, function (model) {
        if (R.isNil(model)) return null;

        return state.event('Game.command.execute', 'setLos', ['setOriginResetTarget', [model]]);
      })(state);
    },
    onLeave: function onLeave(state) {
      state.changeEvent('Game.los.remote.change');
    },
    name: 'LoS',
    actions: los_actions,
    buttons: los_buttons,
    bindings: los_bindings
  };
  modesService.registerMode(los_mode);
  settingsService.register('Bindings', los_mode.name, los_default_bindings, function (bs) {
    R.extend(los_mode.bindings, bs);
  });
  return los_mode;
}]);
//# sourceMappingURL=los.js.map
