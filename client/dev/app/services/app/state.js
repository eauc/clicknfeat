'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

(function () {
  angular.module('clickApp.services').factory('appState', appStateServiceFactory);

  appStateServiceFactory.$inject = ['behaviours', 'appError', 'appAction'];
  function appStateServiceFactory(behaviours, appErrorService, appActionService) {
    var stateOnAction = appActionService.action.snapshot(onAction, function () {
      return loop;
    });
    var stateSet = behaviours.signalModel.create();
    self.window.stateSet = stateSet;

    var state = stateSet.orElse(stateOnAction).hold({});
    var loop = state.delay();
    self.window.state = state;

    var stateService = {
      state: state, set: stateSet,
      onAction: onAction,
      init: actionStateInit
    };
    R.curryService(stateService);
    var handleActionError$ = R.curry(handleActionError);

    mount();

    return stateService;

    function mount() {
      appActionService.register('State.Init', actionStateInit);
    }

    function onAction(state, _ref) {
      var _ref2 = _toArray(_ref);

      var action = _ref2[0];

      var args = _ref2.slice(1);

      console.info('===> Action ' + action, args, state);
      console.trace();

      var handler = R.prop(action, appActionService.handlers());
      if (R.isNil(handler)) {
        appErrorService.emit('Unknown action "' + action + '"');
        return null;
      }

      var ret = null;
      try {
        ret = handler.apply(null, [state].concat(_toConsumableArray(args)));
      } catch (e) {
        handleActionError(action, e);
      }

      if ('Promise' === R.type(ret)) {
        ret.catch(handleActionError$(action));
        return null;
      }

      return ret;
    }

    function actionStateInit() {
      return {};
    }

    function handleActionError(action, e) {
      appErrorService.emit('Action "' + action + '" handler error', e);
    }
  }
})();
//# sourceMappingURL=state.js.map
