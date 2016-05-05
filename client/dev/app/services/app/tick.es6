(function() {
  angular.module('clickApp.services')
    .factory('appTick', appTickServiceFactory);

  appTickServiceFactory.$inject = [
    'pubSub'
  ];
  function appTickServiceFactory(pubSubService) {
    const tickService = {
      now: tickNow,
      inTransaction: tickInTransaction,
      addTickListener: tickAddTickListener,
      removeTickListener: tickRemoveTickListener,
      addEndListener: tickAddEndListener,
      removeEndListener: tickRemoveEndListener
    };
    R.curryService(tickService);

    let tick;
    let in_transaction;
    let now;

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
      const _in_transaction = in_transaction;
        in_transaction = true;

      const ret = fn();

      if(_in_transaction) return ret;
        in_transaction = false;

      doTick();
      doEndTick();

      return ret;
    }

    function tickAddTickListener(listener) {
      tick = pubSubService
        .addListener('tick', listener, tick);
    }

    function tickRemoveTickListener(listener) {
      tick = pubSubService
        .removeListener('tick', listener, tick);
    }

    function tickAddEndListener(listener) {
      tick = pubSubService
        .addListener('tickEnd', listener, tick);
    }

    function tickRemoveEndListener(listener) {
      tick = pubSubService
        .removeListener('tickEnd', listener, tick);
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
