(function() {
  angular.module('clickApp.services')
    .factory('appState', appStateServiceFactory);

  appStateServiceFactory.$inject=  [
    'behaviours',
    'appError',
    'appAction'
  ];
  function appStateServiceFactory(behaviours,
                                  appErrorService,
                                  appActionService) {
    const stateOnAction = appActionService.action
            .snapshot(onAction, () => loop);
    const stateSet = behaviours.signalModel.create();
    self.window.stateSet = stateSet;

    const state = stateSet
            .orElse(stateOnAction)
            .hold({});
    const loop = state.delay();
    self.window.state = state;

    const stateService = {
      state, set: stateSet,
      onAction: onAction,
      init: actionStateInit
    };
    R.curryService(stateService);
    const handleActionError$ = R.curry(handleActionError);

    mount();

    return stateService;

    function mount() {
      appActionService.register('State.Init', actionStateInit);
    }

    function onAction(state, [action, ...args]) {
      console.info(`===> Action ${action}`, args, state);
      console.trace();

      const handler = R.prop(action, appActionService.handlers());
      if(R.isNil(handler)) {
        appErrorService.emit(`Unknown action "${action}"`);
        return null;
      }

      let ret = null;
      try {
        ret = handler.apply(null, [ state, ...args ]);
      }
      catch(e) {
        handleActionError(action, e);
      }

      if('Promise' === R.type(ret)) {
        ret.catch(handleActionError$(action));
        return null;
      }

      return ret;
    }

    function actionStateInit() {
      return {};
    }

    function handleActionError(action, e) {
      appErrorService.emit(`Action "${action}" handler error`, e);
    }
  }
})();
