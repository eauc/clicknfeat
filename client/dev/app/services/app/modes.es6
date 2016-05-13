(function() {
  angular.module('clickApp.services')
    .factory('appModes', appModesModelFactory);

  appModesModelFactory.$inject = [
    'appAction',
    'appError',
    'appState',
    'modes',
    'allModes',
  ];
  function appModesModelFactory(appActionService,
                                appErrorService,
                                appStateService,
                                modesModel) {
    const MODES_LENS = R.lensProp('modes');

    const modes = appStateService.state
            .map(R.viewOr({}, MODES_LENS));
    const bindings = modes
            .map(updateCurrentModeBindings);

    const appModesService = {
      modes, bindings,
      switchTo: actionModesSwitchTo,
      currentAction: actionModesCurrentAction,
      reset: actionModesReset,
      exit: actionModesExit
    };
    R.curryService(appModesService);

    mount();

    return appModesService;

    function mount() {
      appActionService
        .register('Modes.switchTo'       , actionModesSwitchTo)
        .register('Modes.current.action' , actionModesCurrentAction)
        .register('Modes.reset'          , actionModesReset)
        .register('Modes.exit'           , actionModesExit);
    }
    function actionModesSwitchTo(state, to) {
      return R.over(
        MODES_LENS,
        modesModel.switchToMode$(to),
        state
      );
    }
    function actionModesCurrentAction(state, action, args) {
      const event = R.last(args);
      if(R.exists(R.prop('preventDefault', event))) {
        event.preventDefault();
      }

      return R.over(
        MODES_LENS,
        R.pipe(
          modesModel.currentModeActionP$(action, [state, ...args]),
          R.when(
            (res) => ('Promise' === R.type(res)),
            (res) => R.resolveP(res)
              .catch((error) => appErrorService.emit(error))
          )
        ),
        state
      );
    }
    function actionModesReset(state) {
      return R.set(MODES_LENS, modesModel.init(), state);
    }
    function actionModesExit(state) {
      return R.over(MODES_LENS, modesModel.exit, state);
    }
    function updateCurrentModeBindings(modes) {
      const bindings = R.thread(modes)(
        modesModel.currentModeBindings,
        R.clone
      );
      const buttons = R.thread(modes)(
        modesModel.currentModeButtons,
        R.clone
      );
      return { bindings, buttons };
    }
  }
})();
