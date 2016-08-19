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
        isEmpty: elementSelectionIsEmpty,
        checkMode: elementSelectionCheckMode,
        set: elementSelectionSet,
        addTo: elementSelectionAddTo,
        removeFrom: elementSelectionRemoveFrom,
        clear: elementSelectionClear
      };
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
      function elementSelectionIsEmpty(where, selection) {
        return R.thread(selection)(gameElementSelectionModel.get$(where), R.isEmpty);
      }
      function elementSelectionCheckMode(selection) {
        return R.thread(selection)(gameElementSelectionModel.get$('local'), R.ifElse(R.isEmpty, function () {
          return null;
        }, function () {
          return s.capitalize(type);
        }));
      }
      function elementSelectionSet(where, stamps, selection) {
        return R.assoc(where, stamps, selection);
      }
      function elementSelectionAddTo(where, stamps, selection) {
        var previous = gameElementSelectionModel.get(where, selection);
        var new_selection = R.uniq(R.concat(previous, stamps));
        return R.assoc(where, new_selection, selection);
      }
      function elementSelectionRemoveFrom(where, stamps, selection) {
        var previous = R.prop(where, selection);
        var new_selection = R.differenceWith(R.eq, previous, stamps);
        return R.assoc(where, new_selection, selection);
      }
      function elementSelectionClear(where, selection) {
        var previous = R.prop(where, selection);
        return gameElementSelectionModel.removeFrom(where, previous, selection);
      }
    };
  }
})();
//# sourceMappingURL=elementSelection.js.map
