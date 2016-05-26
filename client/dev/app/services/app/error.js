'use strict';

(function () {
  angular.module('clickApp.services').factory('appError', appErrorServiceFactory);

  appErrorServiceFactory.$inject = ['$rootScope', 'pubSub'];
  function appErrorServiceFactory($rootScope, pubSubService) {
    var errorService = {
      emit: errorEmit,
      addListener: errorAddListener,
      removeListener: errorRemoveListener
    };
    R.curryService(errorService);

    var event = R.thread()(function () {
      return pubSubService.create();
    }, pubSubService.addListener$('error', defaultErrorListener));
    self.window.onerror = uncaughtErrorHandler;
    return errorService;

    function errorEmit() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      pubSubService.emit('error', args, event);
    }

    function errorAddListener(listener) {
      event = pubSubService.addListener('error', listener, event);
    }

    function errorRemoveListener(listener) {
      event = pubSubService.removeListener('error', listener, event);
    }

    function defaultErrorListener(_event_, args) {
      console.error('APP ERROR ***', args);
    }

    function uncaughtErrorHandler(msg, url, line) {
      errorEmit(msg + ' ' + url + ':' + line);
      $rootScope.$digest();
      return true;
    }
  }
})();
//# sourceMappingURL=error.js.map
