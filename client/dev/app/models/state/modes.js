'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function () {
  angular.module('clickApp.services').factory('stateModes', stateModesModelFactory);

  stateModesModelFactory.$inject = ['modes', 'allModes'];
  function stateModesModelFactory(modesModel) {
    var stateModesModel = {
      create: stateModesCreate,
      save: stateModesSave,
      onModesSwitchTo: stateModesOnSwitchTo,
      onModesCurrentAction: stateModesOnCurrentAction,
      onModesReset: stateModesOnReset,
      onModesExit: stateModesOnExit
    };

    var setModes$ = R.curry(setModes);
    var gameActionError$ = R.curry(gameActionError);

    R.curryService(stateModesModel);
    return stateModesModel;

    function stateModesCreate(state) {
      state.modes = {};

      state.onEvent('Modes.switchTo', stateModesModel.onModesSwitchTo$(state));
      state.onEvent('Modes.current.action', stateModesModel.onModesCurrentAction$(state));
      state.onEvent('Modes.reset', stateModesModel.onModesReset$(state));
      state.onEvent('Modes.exit', stateModesModel.onModesExit$(state));
      return state;
    }
    function stateModesSave(state) {
      return state;
    }
    function stateModesOnSwitchTo(state, event, to) {
      return R.threadP(state.modes)(modesModel.switchToModeP$(to, state), setModes$(state)).catch(gameActionError$(state));
    }
    function stateModesOnCurrentAction(state, e, action, args) {
      var res = modesModel.currentModeActionP(action, [state].concat(_toConsumableArray(args)), state.modes);
      var event = R.last(args);
      if (R.exists(R.prop('preventDefault', event))) {
        event.preventDefault();
      }

      return self.Promise.resolve(res).catch(gameActionError$(state));
    }
    function stateModesOnReset(state, event) {
      event = event;
      return R.threadP(state)(modesModel.initP, setModes$(state));
    }
    function stateModesOnExit(state, event) {
      event = event;
      return R.threadP(state.modes)(modesModel.exit$(state), setModes$(state));
    }
    function setModes(state, modes) {
      state.modes = modes;
      state.queueChangeEventP('Modes.change');
    }
    function gameActionError(state, error) {
      state.queueChangeEventP('Game.action.error', error);
      return null;
    }
  }
})();
//# sourceMappingURL=modes.js.map
