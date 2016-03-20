'use strict';

(function () {
  angular.module('clickApp.services').factory('gameElementSelection', gameElementSelectionModelFactory);

  gameElementSelectionModelFactory.$inject = [];
  function gameElementSelectionModelFactory() {
    return function buildElementSelectionModel(type) {
      var gameElementSelectionModel = {
        create: elementSelectionCreate,
        'in': elementSelectionIn,
        get: elementSelectionGet,
        checkModeP: elementSelectionCheckModeP,
        set: elementSelectionSet,
        addTo: elementSelectionAddTo,
        removeFrom: elementSelectionRemoveFrom,
        clear: elementSelectionClear
      };

      var emitChangeEvent$ = R.curry(emitChangeEvent);
      R.curryService(gameElementSelectionModel);
      return gameElementSelectionModel;

      function elementSelectionCreate() {
        return {
          local: [],
          remote: []
        };
      }
      function elementSelectionIn(where, stamp, selection) {
        var stamps = R.prop(where, selection);
        return R.find(R.equals(stamp), stamps);
      }
      function elementSelectionGet(where, selection) {
        return R.propOr([], where, selection);
      }
      function elementSelectionCheckModeP(state, selection) {
        return R.threadP(selection)(gameElementSelectionModel.get$('local'), R.head, R.rejectIf(R.isNil, 'No ' + type + ' selection'), function () {
          state.queueEventP('Modes.switchTo', s.capitalize(type));
        });
      }
      function elementSelectionSet(where, stamps, state, selection) {
        var previous = gameElementSelectionModel.get(where, selection);
        var ret = R.assoc(where, stamps, selection);

        checkSelection(where, state);

        R.forEach(emitChangeEvent$(state), stamps);
        R.forEach(emitChangeEvent$(state), previous);

        return ret;
      }
      function elementSelectionAddTo(where, stamps, state, selection) {
        var previous = gameElementSelectionModel.get(where, selection);
        var new_selection = R.uniq(R.concat(previous, stamps));
        var ret = R.assoc(where, new_selection, selection);

        checkSelection(where, state);

        R.forEach(emitChangeEvent$(state), new_selection);

        return ret;
      }
      function elementSelectionRemoveFrom(where, stamps, state, selection) {
        var previous = R.prop(where, selection);
        var new_selection = R.difference(previous, stamps);
        var ret = R.assoc(where, new_selection, selection);

        checkSelection(where, state);

        R.forEach(emitChangeEvent$(state), R.uniq(R.concat(previous, stamps)));

        return ret;
      }
      function elementSelectionClear(where, state, selection) {
        var previous = R.prop(where, selection);
        return gameElementSelectionModel.removeFrom(where, previous, state, selection);
      }
      function checkSelection(where, state) {
        if ('local' === where) {
          state.queueChangeEventP('Game.selection.local.change');
          state.queueChangeEventP('Game.' + type + '.selection.local.change');
        }
      }
      function emitChangeEvent(state, stamp) {
        state.queueChangeEventP('Game.' + type + '.change.' + stamp);
      }
    };
  }
})();
//# sourceMappingURL=elementSelection.js.map
