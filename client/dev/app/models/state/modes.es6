(function() {
  angular.module('clickApp.services')
    .factory('stateModes', stateModesModelFactory);

  stateModesModelFactory.$inject = [
    'modes',
    'appState',
    'state',
    'allModes',
  ];
  function stateModesModelFactory(modesModel,
                                  appStateService,
                                  stateModel) {
    const MODES_LENS = R.lensProp('modes');
    const stateModesModel = {
      create: stateModesCreate,
      onModesSwitchTo: stateModesOnSwitchTo,
      onModesCurrentAction: stateModesOnCurrentAction,
      onModesReset: stateModesOnReset,
      onModesExit: stateModesOnExit
    };
    R.curryService(stateModesModel);
    stateModel.register(stateModesModel);
    return stateModesModel;

    function stateModesCreate(state) {
      appStateService
        .addReducer('Modes.switchTo'       , stateModesModel.onModesSwitchTo)
        .addReducer('Modes.current.action' , stateModesModel.onModesCurrentAction)
        .addReducer('Modes.reset'          , stateModesModel.onModesReset)
        .addReducer('Modes.exit'           , stateModesModel.onModesExit);

      appStateService
        .onChange('AppState.change',
                  'Modes.change',
                  R.pathOr({}, ['modes','current']));

      return R.thread(state)(
        R.assoc('modes', {})
      );
    }
    function stateModesOnSwitchTo(state, _event_, [to]) {
      return R.over(
        MODES_LENS,
        modesModel.switchToMode$(to),
        state
      );
    }
    function stateModesOnCurrentAction(state, _event_, [action, args]) {
      const event = R.last(args);
      if(R.exists(R.prop('preventDefault', event))) {
        event.preventDefault();
      }

      return R.thread(state.modes)(
        modesModel.currentModeActionP$(action, [state, ...args]),
        R.when(
          (res) => ('Promise' === R.type(res)),
          (res) => R.resolveP(res)
            .catch((error) => appStateService.emit('Game.error', error))
        )
      );
    }
    function stateModesOnReset(state) {
      return R.set(MODES_LENS, modesModel.init(), state);
    }
    function stateModesOnExit(state, _event_) {
      return R.over(
        MODES_LENS,
        modesModel.exit,
        state
      );
    }
  }
})();
