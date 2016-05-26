'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function () {
  angular.module('clickApp.services').factory('appModes', appModesModelFactory);

  appModesModelFactory.$inject = ['appAction', 'appError', 'appState', 'modes'];
  function appModesModelFactory(appActionService, appErrorService, appStateService, modesModel) {
    var MODES_LENS = R.lensProp('modes');

    var modes = appStateService.state.map(R.viewOr({}, MODES_LENS));
    var bindings = modes.map(updateCurrentModeBindings);

    var appModesService = {
      modes: modes, bindings: bindings,
      switchTo: actionModesSwitchTo,
      currentAction: actionModesCurrentAction,
      reset: actionModesReset,
      exit: actionModesExit
    };
    R.curryService(appModesService);

    mount();

    return appModesService;

    function mount() {
      appActionService.register('Modes.switchTo', actionModesSwitchTo).register('Modes.current.action', actionModesCurrentAction).register('Modes.reset', actionModesReset).register('Modes.exit', actionModesExit);
    }
    function actionModesSwitchTo(state, to) {
      return R.over(MODES_LENS, modesModel.switchToMode$(to), state);
    }
    function actionModesCurrentAction(state, action, args) {
      var event = R.last(args);
      if (R.exists(R.prop('preventDefault', event))) {
        event.preventDefault();
      }

      return R.thread(state)(R.view(MODES_LENS), modesModel.currentModeActionP$(action, [state].concat(_toConsumableArray(args))), R.when(function (res) {
        return 'Promise' === R.type(res);
      }, function (res) {
        return R.resolveP(res).catch(appErrorService.emit);
      }));
    }
    function actionModesReset(state) {
      return R.set(MODES_LENS, modesModel.init(), state);
    }
    function actionModesExit(state) {
      return R.over(MODES_LENS, modesModel.exit, state);
    }
    function updateCurrentModeBindings(modes) {
      var bindings = R.thread(modes)(modesModel.currentModeBindings, R.clone);
      var buttons = R.thread(modes)(modesModel.currentModeButtons, R.clone);
      return { bindings: bindings, buttons: buttons };
    }
  }
})();
//# sourceMappingURL=modes.js.map
