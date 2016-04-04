(function() {
  angular.module('clickApp.services')
    .factory('gameElementSelection', gameElementSelectionModelFactory);

  gameElementSelectionModelFactory.$inject = [];
  function gameElementSelectionModelFactory() {
    return function buildElementSelectionModel(type) {
      const gameElementSelectionModel = {
        create: elementSelectionCreate,
        'in': elementSelectionIn,
        get: elementSelectionGet,
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
        const stamps = R.prop(where, selection);
        return R.find(R.equals(stamp), stamps);
      }
      function elementSelectionGet(where, selection) {
        return R.propOr([], where, selection);
      }
      function elementSelectionCheckMode(selection) {
        return R.thread(selection)(
          gameElementSelectionModel.get$('local'),
          R.ifElse(
            R.isEmpty,
            () => null,
            () => s.capitalize(type)
          )
        );
      }
      function elementSelectionSet(where, stamps, selection) {
        return R.assoc(where, stamps, selection);
      }
      function elementSelectionAddTo(where, stamps, selection) {
        const previous = gameElementSelectionModel.get(where, selection);
        const new_selection = R.uniq(R.concat(previous, stamps));
        return R.assoc(where, new_selection, selection);
      }
      function elementSelectionRemoveFrom(where, stamps, selection) {
        const previous = R.prop(where, selection);
        const new_selection = R.difference(previous, stamps);
        return R.assoc(where, new_selection, selection);
      }
      function elementSelectionClear(where, selection) {
        const previous = R.prop(where, selection);
        return gameElementSelectionModel
          .removeFrom(where, previous, selection);
      }
    };
  }
})();
