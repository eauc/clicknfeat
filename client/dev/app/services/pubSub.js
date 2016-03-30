'use strict';

(function () {
  angular.module('clickApp.services').factory('pubSub', pubSubServiceFactory);

  pubSubServiceFactory.$inject = [];
  function pubSubServiceFactory() {
    // Subscribe to this event to see all events
    var WATCH_EVENT = '#ALL#';

    var pubSubService = {
      create: pubSubCreate,
      emit: pubSubEmit,
      addListener: pubSubAdd$('listeners'),
      removeListener: pubSubRemove$('listeners'),
      reduce: pubSubReduce,
      addReducer: pubSubAdd$('reducers'),
      removeReducer: pubSubRemove$('reducers')
    };
    var warnOnEmptyWatchers$ = R.curry(warnOnEmptyWatchers);
    R.curryService(pubSubService);
    return pubSubService;

    function pubSubCreate() {
      return {
        listeners: {},
        reducers: {}
      };
    }

    function pubSubEmit(event, args, pubSub) {
      console.info('---> ' + event, args);
      // console.trace();
      return R.thread()(signalListeners(event), signalListeners(WATCH_EVENT));

      function signalListeners(event) {
        return function () {
          return R.thread(pubSub)(R.pathOr([], ['listeners', event]), warnOnEmptyWatchers$(event), R.forEach(callListener));
        };
      }
      function callListener(listener) {
        try {
          listener.apply(null, [event, args]);
        } catch (error) {
          console.error('xxx> ' + event + ' : listener error', error, listener);
        }
      }
    }

    function pubSubReduce(event, args, value, pubSub) {
      console.info('===> ' + event, args);
      console.trace();
      return R.thread(value)(callReducers(event), callReducers(WATCH_EVENT));

      function callReducers(event) {
        return function (current_value) {
          return R.thread(pubSub)(R.pathOr([], ['reducers', event]), warnOnEmptyWatchers$(event), R.reduce(callReducer, current_value));
        };
      }
      function callReducer(mem, reducer) {
        var ret = undefined;
        try {
          ret = reducer.apply(null, [mem, event, args]);
          return R.exists(ret) ? ret : mem;
        } catch (error) {
          console.error('xxx> ' + event + ' : reducer error', error, reducer);
          return mem;
        }
      }
    }

    function pubSubAdd$(type) {
      return function pubSubAdd(event, reducer, pubSub) {
        return R.over(R.lensPath([type, event]), R.pipe(R.defaultTo([]), R.append(reducer)), pubSub);
      };
    }

    function pubSubRemove$(type) {
      return function (event, reducer, pubSub) {
        return R.over(R.lensPath([type, event]), R.pipe(R.defaultTo([]), R.reject(R.equals(reducer))), pubSub);
      };
    }

    function warnOnEmptyWatchers(event, watchers) {
      return R.when(function (watchers) {
        return R.isEmpty(watchers) && event !== WATCH_EVENT;
      }, R.spyWarn('...> ' + event + ' with no watchers'), watchers);
    }
  }
})();
//# sourceMappingURL=pubSub.js.map
