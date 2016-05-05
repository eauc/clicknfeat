(function() {
  angular.module('clickApp.services')
    .factory('appError', appErrorServiceFactory);

  appErrorServiceFactory.$inject=  [
    'pubSub',
  ];
  function appErrorServiceFactory(pubSubService) {
    const errorService = {
      emit: errorEmit,
      addListener: errorAddListener,
      removeListener: errorRemoveListener
    };
    R.curryService(errorService);

    let event = R.thread()(
      () => pubSubService.create(),
      pubSubService.addListener$('error', defaultErrorListener)
    );

    return errorService;

    function errorEmit(message) {
      pubSubService.emit('error', message, event);
    }

    function errorAddListener(listener) {
      event = pubSubService
        .addListener('error', listener, event);
    }

    function errorRemoveListener(listener) {
      event = pubSubService
        .removeListener('error', listener, event);
    }

    function defaultErrorListener(...args) {
      console.error('APP ERROR ***', args);
    }
  }
})();
