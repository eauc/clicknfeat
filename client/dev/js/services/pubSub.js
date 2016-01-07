'use strict';

angular.module('clickApp.services').factory('pubSub', [function pubSubServiceFactory() {
  // Subscribe to this event to see all events
  var WATCH_EVENT = '#watch#';
  var pubSubService = {
    init: function pubSubInit(data) {
      var name = arguments.length <= 1 || arguments[1] === undefined ? 'channel' : arguments[1];

      return R.pipe(R.defaultTo({}), R.assoc('_pubSubName', name), R.assoc('_pubSubCache', {}))(data);
    },
    subscribe: function pubSubSubscribe(event, listener, pubSub) {
      return R.pipe(R.prop('_pubSubCache'), function (cache) {
        return R.pipe(R.propOr([], event), R.append(listener), function (listeners) {
          cache[event] = listeners;
          // console.log(pubSub._pubSubName, event, listeners.length);
          return unsubscribe(event, listener, cache);
        })(cache);
      })(pubSub);
    },
    publish: function pubSubPublish() /*, pubSub */{
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var event = args[0];

      return R.pipePromise(R.last, signalListeners(event, R.init(args)), signalListeners(WATCH_EVENT, R.init(args)))(args);
    }
  };
  function unsubscribe(event, listener, cache) {
    return function () {
      cache[event] = R.reject(R.equals(listener), cache[event]);
    };
  }
  var signalListeners = R.curry(function (event, args, channel) {
    return R.pipePromise(R.pathOr([], ['_pubSubCache', event]), function (listeners) {
      if (R.isEmpty(listeners) && event !== WATCH_EVENT) {
        console.warn('Event: "' + channel._pubSubName + '>' + event + '" with no listeners');
      }
      return listeners;
    }, R.map(function (listener) {
      return new self.Promise(function (resolve) {
        var ret = undefined;
        try {
          ret = listener.apply(null, args);
        } catch (error) {
          console.error('Listener error: "' + channel._pubSubName + '>' + event + '"', listener, error);
        }
        resolve(ret);
      });
    }), R.promiseAll, R.always(channel))(channel);
  });
  R.curryService(pubSubService);
  return pubSubService;
}]);
//# sourceMappingURL=pubSub.js.map
