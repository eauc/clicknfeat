'use strict';

(function () {
  angular.module('clickApp.services').factory('appAction', appActionServiceFactory);

  appActionServiceFactory.$inject = ['$rootScope', 'behaviours'];
  function appActionServiceFactory($rootScope, behaviours) {
    var ACTIONS = {};

    var action = behaviours.signalModel.create();

    var actionService = {
      action: action,
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
      if ('Function' !== R.type(handler)) {
        console.error('*** ' + action + ' registering handler is not a Function');
        return actionService;
      }
      if (R.exists(R.prop(action, ACTIONS))) {
        console.warn('*** Action ' + action + ' already registered');
      }
      ACTIONS = R.assoc(action, handler, ACTIONS);
      return actionService;
    }
    function actionDo() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      action.send(args);
      $rootScope.$digest();
    }
    function actionDefer() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      self.window.requestAnimationFrame(function () {
        actionDo.apply(null, args);
      });
    }
  }
})();
//# sourceMappingURL=action.js.map
