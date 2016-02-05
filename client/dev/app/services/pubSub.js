'use strict';

(function () {
  angular.module('clickApp.services').factory('pubSub', pubSubServiceFactory);

  pubSubServiceFactory.$inject = [];
  function pubSubServiceFactory() {
    // Subscribe to this event to see all events
    var WATCH_EVENT = '#watch#';
    var pubSubService = {
      init: pubSubInit,
      subscribe: pubSubSubscribe,
      publishP: pubSubPublishP
    };
    var signalListenersP$ = R.curry(signalListenersP);
    R.curryService(pubSubService);
    return pubSubService;

    function pubSubInit(data) {
      var name = arguments.length <= 1 || arguments[1] === undefined ? 'channel' : arguments[1];

      return R.thread(data)(R.defaultTo({}), R.assoc('_pubSubName', name), R.assoc('_pubSubCache', {}));
    }
    function pubSubSubscribe(event, listener, pubSub) {
      return R.thread(pubSub)(R.prop('_pubSubCache'), function (cache) {
        return R.thread(cache)(R.propOr([], event), R.append(listener), function (listeners) {
          cache[event] = listeners;
          return unsubscribe(event, listener, cache);
        });
      });
    }
    function pubSubPublishP() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var event = args[0];

      return R.threadP(args)(R.last, signalListenersP$(event, R.init(args)), signalListenersP$(WATCH_EVENT, R.init(args)));
    }
    function unsubscribe(event, listener, cache) {
      return function () {
        cache[event] = R.reject(R.equals(listener), cache[event]);
      };
    }
    function signalListenersP(event, args, channel) {
      return R.threadP(channel)(R.pathOr([], ['_pubSubCache', event]), warnIfNoListeners, R.map(resolveListenerP), R.promiseAll, R.always(channel));

      function warnIfNoListeners(listeners) {
        if (R.isEmpty(listeners) && event !== WATCH_EVENT) {
          console.warn('Event: "' + channel._pubSubName + '>' + event + '" with no listeners');
        }
        return listeners;
      }
      function resolveListenerP(listener) {
        return new self.Promise(function (resolve) {
          var ret = undefined;
          try {
            ret = listener.apply(null, args);
          } catch (error) {
            console.error('Listener error: "' + channel._pubSubName + '>' + event + '"', listener, error);
          }
          resolve(ret);
        });
      }
    }
  }
})();
//# sourceMappingURL=pubSub.js.map
