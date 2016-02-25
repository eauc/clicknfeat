(function() {
  angular.module('clickApp.services')
    .factory('gameTerrainSelection', gameTerrainSelectionModelFactory);

  gameTerrainSelectionModelFactory.$inject = [];
  function gameTerrainSelectionModelFactory() {
    const gameTerrainSelectionModel = {
      create: terrainSelectionCreate,
      'in': terrainSelectionIn,
      get: terrainSelectionGet,
      checkModeP: terrainSelectionCheckModeP,
      set: terrainSelectionSet,
      addTo: terrainSelectionAddTo,
      removeFrom: terrainSelectionRemoveFrom,
      clear: terrainSelectionClear
    };

    const emitChangeEvent$ = R.curry(emitChangeEvent);
    R.curryService(gameTerrainSelectionModel);
    return gameTerrainSelectionModel;

    function terrainSelectionCreate() {
      return {
        local: [],
        remote: []
      };
    }
    function terrainSelectionIn(where, stamp, selection) {
      const stamps = R.prop(where, selection);
      return R.find(R.equals(stamp), stamps);
    }
    function terrainSelectionGet(where, selection) {
      return R.propOr([], where, selection);
    }
    function terrainSelectionCheckModeP(state, selection) {
      return R.threadP(selection)(
        gameTerrainSelectionModel.get$('local'),
        R.head,
        R.rejectIf(R.isNil, 'No terrain selection'),
        () => {
          state.queueEventP('Modes.switchTo', 'Terrain');
        }
      );
    }
    function terrainSelectionSet(where, stamps, state, selection) {
      const previous = gameTerrainSelectionModel.get(where, selection);
      const ret = R.assoc(where, stamps, selection);

      checkSelection(where, state);

      R.forEach(emitChangeEvent$(state), stamps);
      R.forEach(emitChangeEvent$(state), previous);

      return ret;
    }
    function terrainSelectionAddTo(where, stamps, state, selection) {
      const previous = gameTerrainSelectionModel.get(where, selection);
      const new_selection = R.uniq(R.concat(previous, stamps));
      const ret = R.assoc(where, new_selection, selection);

      checkSelection(where, state);

      R.forEach(emitChangeEvent$(state), new_selection);

      return ret;
    }
    function terrainSelectionRemoveFrom(where, stamps, state, selection) {
      const previous = R.prop(where, selection);
      const new_selection = R.difference(previous, stamps);
      const ret = R.assoc(where, new_selection, selection);

      checkSelection(where, state);

      R.forEach(emitChangeEvent$(state),
                R.uniq(R.concat(previous, stamps)));

      return ret;
    }
    function terrainSelectionClear(where, state, selection) {
      const previous = R.prop(where, selection);
      return gameTerrainSelectionModel
        .removeFrom(where, previous, state, selection);
    }
    function checkSelection(where, state) {
      if('local' === where) {
        state.queueEventP('Modes.switchTo', 'Default');
        state.queueChangeEventP('Game.terrain.selection.local.change');
      }
    }
    function emitChangeEvent(state, stamp) {
      state.queueChangeEventP(`Game.terrain.change.${stamp}`);
    }
  }
})();
