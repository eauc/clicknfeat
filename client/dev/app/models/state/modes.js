'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

angular.module('clickApp.services').factory('stateModes', ['modes', 'allModes', function stateModesServiceFactory(modesService) {
  var stateModesService = {
    init: function stateModesInit(state) {
      state.modes = {};

      state.onEvent('Modes.switchTo', stateModesService.onModesSwitchTo$(state));
      state.onEvent('Modes.current.action', stateModesService.onModesCurrentAction$(state));
      state.onEvent('Modes.reset', stateModesService.onModesReset$(state));
      state.onEvent('Modes.exit', stateModesService.onModesExit$(state));
      return state;
    },
    save: function stateModesSave(state) {
      return state;
    },
    onModesSwitchTo: function stateModesOnSwitchTo(state, event, to) {
      return R.pipePromise(modesService.switchToMode$(to, state), setModes$(state))(state.modes).catch(gameActionError$(state));
    },
    onModesCurrentAction: function stateModesOnCurrentAction(state, e, action, args) {
      var res = modesService.currentModeAction(action, [state].concat(_toConsumableArray(args)), state.modes);
      var event = R.last(args);
      if (R.exists(R.prop('preventDefault', event))) event.preventDefault();

      return self.Promise.resolve(res).catch(gameActionError$(state));
    },
    onModesReset: function stateModesOnReset(state, event) {
      event = event;
      return R.pipePromise(modesService.init, setModes$(state))(state);
    },
    onModesExit: function stateModesOnExit(state, event) {
      event = event;
      return R.pipePromise(modesService.exit$(state), setModes$(state))(state.modes);
    }
  };
  var setModes$ = R.curry(function (state, modes) {
    state.modes = modes;
    state.changeEvent('Modes.change');
  });
  var gameActionError$ = R.curry(function (state, error) {
    state.changeEvent('Game.action.error', error);
    return null;
    // return self.Promise.reject(error);
  });
  R.curryService(stateModesService);
  return stateModesService;
}]);
//# sourceMappingURL=modes.js.map
