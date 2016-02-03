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
      publish: pubSubPublish
    };
    var signalListeners$ = R.curry(signalListeners);
    R.curryService(pubSubService);
    return pubSubService;

    function pubSubInit(data) {
      var name = arguments.length <= 1 || arguments[1] === undefined ? 'channel' : arguments[1];

      return R.pipe(R.defaultTo({}), R.assoc('_pubSubName', name), R.assoc('_pubSubCache', {}))(data);
    }
    function pubSubSubscribe(event, listener, pubSub) {
      return R.pipe(R.prop('_pubSubCache'), function (cache) {
        return R.pipe(R.propOr([], event), R.append(listener), function (listeners) {
          cache[event] = listeners;
          return unsubscribe(event, listener, cache);
        })(cache);
      })(pubSub);
    }
    function pubSubPublish() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var event = args[0];

      return R.pipePromise(R.last, signalListeners$(event, R.init(args)), signalListeners$(WATCH_EVENT, R.init(args)))(args);
    }
    function unsubscribe(event, listener, cache) {
      return function () {
        cache[event] = R.reject(R.equals(listener), cache[event]);
      };
    }
    function signalListeners(event, args, channel) {
      return R.pipePromise(R.pathOr([], ['_pubSubCache', event]), warnIfNoListeners, R.map(resolveListener), R.promiseAll, R.always(channel))(channel);

      function warnIfNoListeners(listeners) {
        if (R.isEmpty(listeners) && event !== WATCH_EVENT) {
          console.warn('Event: "' + channel._pubSubName + '>' + event + '" with no listeners');
        }
        return listeners;
      }
      function resolveListener(listener) {
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
