angular.module('clickApp.services')
  .factory('pubSub', [
    function pubSubServiceFactory() {
      // Subscribe to this event to see all events
      var WATCH_EVENT = '#watch#';
      var pubSubService = {
        init: function pubSubInit(data, name = 'channel') {
          return R.pipe(
            R.defaultTo({}),
            R.assoc('_pubSubName', name),
            R.assoc('_pubSubCache', {})
          )(data);
        },
        subscribe: function pubSubSubscribe(event, listener, pubSub) {
          return R.pipe(
            R.prop('_pubSubCache'),
            (cache) => {
              return R.pipe(
                R.propOr([], event),
                R.append(listener),
                (listeners) => {
                  cache[event] = listeners;
                  // console.log(pubSub._pubSubName, event, listeners.length);
                  return unsubscribe(event, listener, cache);
                }
              )(cache);
            }
          )(pubSub);
        },
        publish: function pubSubPublish(...args /*, pubSub */) {
          var [event] = args;
          return R.pipePromise(
            R.last,
            signalListeners(event, R.init(args)),
            signalListeners(WATCH_EVENT, R.init(args))
          )(args);
        }
      };
      function unsubscribe(event, listener, cache) {
        return () => {
          cache[event] = R.reject(R.equals(listener), cache[event]);
        };
      }
      var signalListeners = R.curry((event, args, channel) => {
        return R.pipePromise(
          R.pathOr([], ['_pubSubCache', event]),
          (listeners) => {
            if(R.isEmpty(listeners) &&
               event !== WATCH_EVENT) {
              console.warn(`Event: "${channel._pubSubName}>${event}" with no listeners`);
            }
            return listeners;
          },
          R.map((listener) => {
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
          }),
          R.promiseAll,
          R.always(channel)
        )(channel);
      });
      R.curryService(pubSubService);
      return pubSubService;
    }
  ]);
