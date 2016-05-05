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
      state,
      set: stateSet
    };
    R.curryService(stateService);

    mount();

    return stateService;

    function mount() {
      appActionService.register('State.Init', onStateInit);
    }

    function onAction(state, [action, ...args]) {
      console.info(`===> Action ${action}`, args, state);
      console.trace();

      let ret = null;

      const handler = R.prop(action, appActionService.handlers());
      if(R.isNil(handler)) {
        appErrorService.emit(`Unknown action "${action}"`);
        return ret;
      }
      try {
        ret = handler.apply(null, [ state, ...args ]);
      }
      catch(e) {
        appErrorService.emit(`Action "${action}" handler error`, e);
      }
      return ( 'Promise' === R.type(ret) || R.isNil(ret)
               ? state
               : ret
             );
    }

    function onStateInit() {
      const init = {};
      console.info('State.Init', init);
      return init;
    }
  }
})();
