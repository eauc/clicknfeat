'use strict';

self.pubSubServiceFactory = function pubSubServiceFactory() {
  // Subscribe to this event to see all events
  var WATCH_EVENT = '#watch#';
  var pubSubService = {
    init: function pubSubInit(data) {
      return R.pipe(
        R.defaultTo({}),
        R.assoc('_pubSubCache', {})
      )(data);
    },
    subscribe: function pubSubSubscribe(event, listener, pubSub) {
      return R.pipe(
        R.prop('_pubSubCache'),
        function(cache) {
          return R.pipe(
            R.propOr([], event),
            R.append(listener),
            function(listeners) {
              cache[event] = listeners;
              return unsubscribe(event, listener, cache);
            }
          )(cache);
        }
      )(pubSub);
    },
    publish: function pubSubPublish(event /*, ...args..., pubSub */) {
      R.pipe(
        function(args) {
          R.pipe(
            R.last,
            R.prop('_pubSubCache'),
            signalListeners(event, R.init(args)),
            signalListeners(WATCH_EVENT, R.init(args))
          )(args);
        }
      )(Array.prototype.slice.call(arguments));
    }
  };
  function unsubscribe(event, listener, cache) {
    return function() {
      cache[event] = R.reject(R.eq(listener), cache[event]);
    };
  }
  var signalListeners = R.curry(function _signalListeners(event, args, cache) {
    R.forEach(function(listener) {
      listener.apply(null, args);
    }, R.propOr([], event, cache));
    return cache;
  });
  R.curryService(pubSubService);
  return pubSubService;
};
