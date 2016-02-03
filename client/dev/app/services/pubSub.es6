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
      publishP: pubSubPublishP
    };
    const signalListenersP$ = R.curry(signalListenersP);
    R.curryService(pubSubService);
    return pubSubService;

    function pubSubInit(data, name = 'channel') {
      return R.thread(data)(
        R.defaultTo({}),
        R.assoc('_pubSubName', name),
        R.assoc('_pubSubCache', {})
      );
    }
    function pubSubSubscribe(event, listener, pubSub) {
      return R.thread(pubSub)(
        R.prop('_pubSubCache'),
        (cache) => {
          return R.thread(cache)(
            R.propOr([], event),
            R.append(listener),
            (listeners) => {
              cache[event] = listeners;
              return unsubscribe(event, listener, cache);
            }
          );
        }
      );
    }
    function pubSubPublishP(...args) {
      const [event] = args;
      return R.threadP(args)(
        R.last,
        signalListenersP$(event, R.init(args)),
        signalListenersP$(WATCH_EVENT, R.init(args))
      );
    }
    function unsubscribe(event, listener, cache) {
      return () => {
        cache[event] = R.reject(R.equals(listener), cache[event]);
      };
    }
    function signalListenersP(event, args, channel) {
      return R.threadP(channel)(
        R.pathOr([], ['_pubSubCache', event]),
        warnIfNoListeners,
        R.map(resolveListenerP),
        R.promiseAll,
        R.always(channel)
      );

      function warnIfNoListeners(listeners) {
        if(R.isEmpty(listeners) &&
           event !== WATCH_EVENT) {
          console.warn(`Event: "${channel._pubSubName}>${event}" with no listeners`);
        }
        return listeners;
      }
      function resolveListenerP(listener) {
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
