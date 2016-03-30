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
      let _value;
      appStateService.addListener(on_event, (_event_, [observable]) => {
        const value = getValue(observable);
        if(value === _value) return;

        _value = value;
        appStateService.emit(emit_event, value);
      });
    }
    function appStateCell(update_event, update, initial) {
      let value = initial;
      appStateService.addListener(update_event, (_event_, [observable]) => {
        value = update(value, observable);
      });
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
