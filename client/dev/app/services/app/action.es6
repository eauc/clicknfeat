(function() {
  angular.module('clickApp.services')
    .factory('appAction', appActionServiceFactory);

  appActionServiceFactory.$inject = [
    '$rootScope',
    'behaviours'
  ];
  function appActionServiceFactory($rootScope,
                                   behaviours) {
    let ACTIONS = {};

    const action = behaviours.signalModel.create();

    const actionService = {
      action,
      handlers: actionHandlers,
      register: actionRegister,
      do: actionDo,
      defer: actionDefer
    };
    R.curryService(actionService);

    return actionService;

    function actionHandlers() {
      return ACTIONS;
    }

    function actionRegister(action, handler) {
      if('Function' !== R.type(handler)) {
        console.error(`*** ${action} registering handler is not a Function`);
        return actionService;
      }
      if(R.exists(R.prop(action, ACTIONS))) {
        console.warn(`*** Action ${action} already registered`);
      }
      ACTIONS = R.assoc(action, handler, ACTIONS);
      return actionService;
    }
    function actionDo(...args) {
      action.send(args);
      $rootScope.$digest();
    }
    function actionDefer(...args) {
      self.window.requestAnimationFrame(() => {
        actionDo.apply(null, args);
      });
    }
  }
})();

