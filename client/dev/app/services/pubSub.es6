(function() {
  angular.module('clickApp.services')
    .factory('pubSub', pubSubServiceFactory);

  pubSubServiceFactory.$inject = [];
  function pubSubServiceFactory() {
    // Subscribe to this event to see all events
    const WATCH_EVENT = '#watch#';
    const pubSubService = {
      init: pubSubInit,
      subscribe: pubSubSubscribe,
      publish: pubSubPublish
    };
    const signalListeners$ = R.curry(signalListeners);
    R.curryService(pubSubService);
    return pubSubService;

    function pubSubInit(data, name = 'channel') {
      return R.pipe(
        R.defaultTo({}),
        R.assoc('_pubSubName', name),
        R.assoc('_pubSubCache', {})
      )(data);
    }
    function pubSubSubscribe(event, listener, pubSub) {
      return R.pipe(
        R.prop('_pubSubCache'),
        (cache) => {
          return R.pipe(
            R.propOr([], event),
            R.append(listener),
            (listeners) => {
              cache[event] = listeners;
              return unsubscribe(event, listener, cache);
            }
          )(cache);
        }
      )(pubSub);
    }
    function pubSubPublish(...args) {
      const [event] = args;
      return R.pipePromise(
        R.last,
        signalListeners$(event, R.init(args)),
        signalListeners$(WATCH_EVENT, R.init(args))
      )(args);
    }
    function unsubscribe(event, listener, cache) {
      return () => {
        cache[event] = R.reject(R.equals(listener), cache[event]);
      };
    }
    function signalListeners(event, args, channel) {
      return R.pipePromise(
        R.pathOr([], ['_pubSubCache', event]),
        warnIfNoListeners,
        R.map(resolveListener),
        R.promiseAll,
        R.always(channel)
      )(channel);

      function warnIfNoListeners(listeners) {
        if(R.isEmpty(listeners) &&
           event !== WATCH_EVENT) {
          console.warn(`Event: "${channel._pubSubName}>${event}" with no listeners`);
        }
        return listeners;
      }
      function resolveListener(listener) {
        return new self.Promise((resolve) => {
          let ret;
          try {
            ret = listener.apply(null, args);
          }
          catch(error) {
            console.error(`Listener error: "${channel._pubSubName}>${event}"`,
                          listener, error);
          }
          resolve(ret);
        });
      }
    }
  }
})();
