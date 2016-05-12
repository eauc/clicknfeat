'use strict';

(function () {
  angular.module('clickApp.services').factory('appTick', appTickServiceFactory);

  appTickServiceFactory.$inject = ['pubSub'];
  function appTickServiceFactory(pubSubService) {
    var tickService = {
      now: tickNow,
      inTransaction: tickInTransaction,
      addTickListener: tickAddTickListener,
      removeTickListener: tickRemoveTickListener,
      addEndListener: tickAddEndListener,
      removeEndListener: tickRemoveEndListener
    };
    R.curryService(tickService);

    var tick = undefined;
    var in_transaction = undefined;
    var now = undefined;

    mount();

    return tickService;

    function mount() {
      tick = pubSubService.create();
      in_transaction = false;
      now = 0;
    }

    function tickNow() {
      return now;
    }

    function tickInTransaction(fn) {
      var _in_transaction = in_transaction;
      in_transaction = true;

      var ret = fn();

      if (_in_transaction) return ret;

      try {
        doTick();
        doEndTick();
      } catch (e) {
        console.error('appTickError', e);
      }
      in_transaction = false;

      return ret;
    }

    function tickAddTickListener(listener) {
      tick = pubSubService.addListener('tick', listener, tick);
    }

    function tickRemoveTickListener(listener) {
      tick = pubSubService.removeListener('tick', listener, tick);
    }

    function tickAddEndListener(listener) {
      tick = pubSubService.addListener('tickEnd', listener, tick);
    }

    function tickRemoveEndListener(listener) {
      tick = pubSubService.removeListener('tickEnd', listener, tick);
    }

    function doTick() {
      now++;
      pubSubService.emit('tick', [now], tick);
    }

    function doEndTick() {
      pubSubService.emit('tickEnd', [now], tick);
    }
  }
})();
//# sourceMappingURL=tick.js.map
