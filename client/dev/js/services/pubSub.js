'use strict';

angular.module('clickApp.services').factory('pubSub', [function pubSubServiceFactory() {
  // Subscribe to this event to see all events
  var WATCH_EVENT = '#watch#';
  var pubSubService = {
    init: function pubSubInit(data) {
      return R.pipe(R.defaultTo({}), R.assoc('_pubSubCache', {}))(data);
    },
    subscribe: function pubSubSubscribe(event, listener, pubSub) {
      return R.pipe(R.prop('_pubSubCache'), function (cache) {
        return R.pipe(R.propOr([], event), R.append(listener), function (listeners) {
          cache[event] = listeners;
          return unsubscribe(event, listener, cache);
        })(cache);
      })(pubSub);
    },
    publish: function pubSubPublish() /*, pubSub */{
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var event = args[0];

      R.pipe(R.last, R.prop('_pubSubCache'), signalListeners(event, R.init(args)), signalListeners(WATCH_EVENT, R.init(args)))(args);
    }
  };
  function unsubscribe(event, listener, cache) {
    return function () {
      cache[event] = R.reject(R.equals(listener), cache[event]);
    };
  }
  var signalListeners = R.curry(function _signalListeners(event, args, cache) {
    var listeners = R.propOr([], event, cache);
    var i = 0;
    self.requestAnimationFrame(function signalListener() {
      if (i >= listeners.length) return;

      listeners[i].apply(null, args);
      i++;
      self.requestAnimationFrame(signalListener);
    });
    return cache;
  });
  R.curryService(pubSubService);
  return pubSubService;
}]);
//# sourceMappingURL=pubSub.js.map
