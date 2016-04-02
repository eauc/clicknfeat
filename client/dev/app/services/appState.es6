(function() {
  angular.module('clickApp.services')
    .factory('appState', appStateServiceFactory);

  appStateServiceFactory.$inject = [
    'pubSub',
    'state'
  ];
  function appStateServiceFactory(pubSubService,
                                  stateModel) {
    let events = pubSubService.create();
    let current_state = {};

    const appStateService = {
      init: appStateInit,
      current: appStateCurrent,
      addReducer: appStateAddReducer,
      reduce: appStateReduce,
      addListener: appStateAddListener,
      removeListener: appStateRemoveListener,
      emit: appStateEmit,
      onChange: appStateOnChange,
      cell: appStateCell,
      filterEvent: appStateFilterEvent
    };
    self.currentAppState = appStateCurrent;
    R.curryService(appStateService);
    return appStateService;

    function appStateInit() {
      current_state = stateModel.create();
      return current_state;
    }
    function appStateCurrent() {
      return current_state;
    }
    function appStateAddReducer(event, reducer) {
      events = pubSubService
        .addReducer(event, reducer, events);
      return appStateService;
    }
    function appStateReduce(event, ...args) {
      const new_state = pubSubService
              .reduce(event, args, current_state, events);
      if(new_state === current_state) return appStateService;

      current_state = new_state;
      appStateService.emit('AppState.change', current_state);

      return appStateService;
    }
    function appStateAddListener(event, listener) {
      events = pubSubService
        .addListener(event, listener, events);
      return appStateService;
    }
    function appStateRemoveListener(event, listener) {
      events = pubSubService
        .removeListener(event, listener, events);
      return appStateService;
    }
    function appStateEmit(event, ...args) {
      pubSubService.emit(event, args, events);
      return appStateService;
    }
    function appStateOnChange(on_event, emit_event, getValue) {
      getValue = R.unless(R.isArrayLike, R.of, getValue);
      let _value = R.map(() => undefined, getValue);
      const hasChanged = R.thread(getValue)(
        R.addIndex(R.map)((getter, i) => ((observable) => (_value[i] !== getter(observable)))),
        R.allPass
      );
      appStateService.addListener(on_event, (_event_, [observable]) => {
        if(!hasChanged(observable)) return;
        _value = R.ap(getValue, [observable]);
        appStateService.emit
          .apply(appStateService, [emit_event, ..._value]);
      });
    }
    function appStateCell(update_event, update, initial) {
      let events = pubSubService.create();
      let value = initial;
      appStateService.addListener(update_event, (_event_, [observable]) => {
        value = update(value, observable);
        pubSubService.emit('update', [value], events);
      });
      return {
        bind: (listener) => {
          const _listener = (_event_, [value]) => {
            listener(value);
          };
          listener(value);
          events = pubSubService.addListener('update', _listener, events);
          return () => {
            events = pubSubService.removeListener('update', _listener, events);
          };
        }
      };
    }
    function appStateFilterEvent(event_in, event_out, filter) {
      appStateService.addListener(event_in, (_event_, [observable]) => {
        if(filter(observable)) {
          appStateService.emit(event_out, observable);
        }
      });
    }
  }
})();
