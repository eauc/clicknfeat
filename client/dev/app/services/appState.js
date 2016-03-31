'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.services').factory('appState', appStateServiceFactory);

  appStateServiceFactory.$inject = ['pubSub', 'state'];
  function appStateServiceFactory(pubSubService, stateModel) {
    var events = pubSubService.create();
    var current_state = {};

    var appStateService = {
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
      events = pubSubService.addReducer(event, reducer, events);
      return appStateService;
    }
    function appStateReduce(event) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var new_state = pubSubService.reduce(event, args, current_state, events);
      if (new_state === current_state) return appStateService;

      current_state = new_state;
      appStateService.emit('AppState.change', current_state);

      return appStateService;
    }
    function appStateAddListener(event, listener) {
      events = pubSubService.addListener(event, listener, events);
      return appStateService;
    }
    function appStateRemoveListener(event, listener) {
      events = pubSubService.removeListener(event, listener, events);
      return appStateService;
    }
    function appStateEmit(event) {
      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      pubSubService.emit(event, args, events);
      return appStateService;
    }
    function appStateOnChange(on_event, emit_event, getValue) {
      var _value = undefined;
      appStateService.addListener(on_event, function (_event_, _ref) {
        var _ref2 = _slicedToArray(_ref, 1);

        var observable = _ref2[0];

        var value = getValue(observable);
        if (value === _value) return;

        _value = value;
        appStateService.emit(emit_event, value);
      });
    }
    function appStateCell(update_event, update, initial) {
      var events = pubSubService.create();
      var value = initial;
      appStateService.addListener(update_event, function (_event_, _ref3) {
        var _ref4 = _slicedToArray(_ref3, 1);

        var observable = _ref4[0];

        value = update(value, observable);
        pubSubService.emit('update', [value], events);
      });
      return {
        bind: function bind(listener) {
          var _listener = function _listener(_event_, _ref5) {
            var _ref6 = _slicedToArray(_ref5, 1);

            var value = _ref6[0];

            listener(value);
          };
          listener(value);
          events = pubSubService.addListener('update', _listener, events);
          return function () {
            events = pubSubService.removeListener('update', _listener, events);
          };
        }
      };
    }
    function appStateFilterEvent(event_in, event_out, filter) {
      appStateService.addListener(event_in, function (_event_, _ref7) {
        var _ref8 = _slicedToArray(_ref7, 1);

        var observable = _ref8[0];

        if (filter(observable)) {
          appStateService.emit(event_out, observable);
        }
      });
    }
  }
})();
//# sourceMappingURL=appState.js.map
