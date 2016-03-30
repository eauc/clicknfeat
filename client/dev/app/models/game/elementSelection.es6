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
        checkModeP: elementSelectionCheckModeP,
        set: elementSelectionSet,
        addTo: elementSelectionAddTo,
        removeFrom: elementSelectionRemoveFrom,
        clear: elementSelectionClear
      };

      const emitChangeEvent$ = R.curry(emitChangeEvent);
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
      function elementSelectionCheckModeP(state, selection) {
        return R.threadP(selection)(
          gameElementSelectionModel.get$('local'),
          R.head,
          R.rejectIfP(R.isNil, `No ${type} selection`),
          () => {
            state.queueEventP('Modes.switchTo', s.capitalize(type));
          }
        );
      }
      function elementSelectionSet(where, stamps, state, selection) {
        const previous = gameElementSelectionModel.get(where, selection);
        const ret = R.assoc(where, stamps, selection);

        checkSelection(where, state);

        R.forEach(emitChangeEvent$(state), stamps);
        R.forEach(emitChangeEvent$(state), previous);

        return ret;
      }
      function elementSelectionAddTo(where, stamps, state, selection) {
        const previous = gameElementSelectionModel.get(where, selection);
        const new_selection = R.uniq(R.concat(previous, stamps));
        const ret = R.assoc(where, new_selection, selection);

        checkSelection(where, state);

        R.forEach(emitChangeEvent$(state), new_selection);

        return ret;
      }
      function elementSelectionRemoveFrom(where, stamps, state, selection) {
        const previous = R.prop(where, selection);
        const new_selection = R.difference(previous, stamps);
        const ret = R.assoc(where, new_selection, selection);

        checkSelection(where, state);

        R.forEach(emitChangeEvent$(state),
                  R.uniq(R.concat(previous, stamps)));

        return ret;
      }
      function elementSelectionClear(where, state, selection) {
        const previous = R.prop(where, selection);
        return gameElementSelectionModel
          .removeFrom(where, previous, state, selection);
      }
      function checkSelection(where, state) {
        if('local' === where) {
          state.queueChangeEventP(`Game.selection.local.change`);
          state.queueChangeEventP(`Game.${type}.selection.local.change`);
        }
      }
      function emitChangeEvent(state, stamp) {
        state.queueChangeEventP(`Game.${type}.change.${stamp}`);
      }
    };
  }
})();
