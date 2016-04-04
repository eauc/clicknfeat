'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function () {
  angular.module('clickApp.services').factory('stateModes', stateModesModelFactory);

  stateModesModelFactory.$inject = ['modes', 'appState', 'state', 'allModes'];
  function stateModesModelFactory(modesModel, appStateService, stateModel) {
    var MODES_LENS = R.lensProp('modes');
    var stateModesModel = {
      create: stateModesCreate,
      onModesSwitchTo: stateModesOnSwitchTo,
      onModesCurrentAction: stateModesOnCurrentAction,
      onModesReset: stateModesOnReset,
      onModesExit: stateModesOnExit
    };
    R.curryService(stateModesModel);
    stateModel.register(stateModesModel);
    return stateModesModel;

    function stateModesCreate(state) {
      appStateService.addReducer('Modes.switchTo', stateModesModel.onModesSwitchTo).addReducer('Modes.current.action', stateModesModel.onModesCurrentAction).addReducer('Modes.reset', stateModesModel.onModesReset).addReducer('Modes.exit', stateModesModel.onModesExit);

      appStateService.onChange('AppState.change', 'Modes.change', R.pathOr({}, ['modes', 'current']));

      return R.thread(state)(R.assoc('modes', {}));
    }
    function stateModesOnSwitchTo(state, _event_, _ref) {
      var _ref2 = _slicedToArray(_ref, 1);

      var to = _ref2[0];

      return R.over(MODES_LENS, modesModel.switchToMode$(to), state);
    }
    function stateModesOnCurrentAction(state, _event_, _ref3) {
      var _ref4 = _slicedToArray(_ref3, 2);

      var action = _ref4[0];
      var args = _ref4[1];

      var event = R.last(args);
      if (R.exists(R.prop('preventDefault', event))) {
        event.preventDefault();
      }

      return R.thread(state.modes)(modesModel.currentModeActionP$(action, [state].concat(_toConsumableArray(args))), R.when(function (res) {
        return 'Promise' === R.type(res);
      }, function (res) {
        return R.resolveP(res).catch(function (error) {
          return appStateService.emit('Game.error', error);
        });
      }));
    }
    function stateModesOnReset(state) {
      return R.set(MODES_LENS, modesModel.init(), state);
    }
    function stateModesOnExit(state, _event_) {
      return R.over(MODES_LENS, modesModel.exit, state);
    }
  }
})();
//# sourceMappingURL=modes.js.map
