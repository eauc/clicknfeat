'use strict';

(function () {
  angular.module('clickApp.services').factory('gameTerrainSelection', gameTerrainSelectionModelFactory);

  gameTerrainSelectionModelFactory.$inject = [];
  function gameTerrainSelectionModelFactory() {
    var gameTerrainSelectionModel = {
      create: terrainSelectionCreate,
      'in': terrainSelectionIn,
      get: terrainSelectionGet,
      checkModeP: terrainSelectionCheckModeP,
      set: terrainSelectionSet,
      addTo: terrainSelectionAddTo,
      removeFrom: terrainSelectionRemoveFrom,
      clear: terrainSelectionClear
    };

    var emitChangeEvent$ = R.curry(emitChangeEvent);
    R.curryService(gameTerrainSelectionModel);
    return gameTerrainSelectionModel;

    function terrainSelectionCreate() {
      return {
        local: [],
        remote: []
      };
    }
    function terrainSelectionIn(where, stamp, selection) {
      var stamps = R.prop(where, selection);
      return R.find(R.equals(stamp), stamps);
    }
    function terrainSelectionGet(where, selection) {
      return R.propOr([], where, selection);
    }
    function terrainSelectionCheckModeP(state, selection) {
      return R.threadP(selection)(gameTerrainSelectionModel.get$('local'), R.head, R.rejectIf(R.isNil, 'No terrain selection'), function () {
        state.queueEventP('Modes.switchTo', 'Terrain');
      });
    }
    function terrainSelectionSet(where, stamps, state, selection) {
      var previous = gameTerrainSelectionModel.get(where, selection);
      var ret = R.assoc(where, stamps, selection);

      checkSelection(where, state);

      R.forEach(emitChangeEvent$(state), stamps);
      R.forEach(emitChangeEvent$(state), previous);

      return ret;
    }
    function terrainSelectionAddTo(where, stamps, state, selection) {
      var previous = gameTerrainSelectionModel.get(where, selection);
      var new_selection = R.uniq(R.concat(previous, stamps));
      var ret = R.assoc(where, new_selection, selection);

      checkSelection(where, state);

      R.forEach(emitChangeEvent$(state), new_selection);

      return ret;
    }
    function terrainSelectionRemoveFrom(where, stamps, state, selection) {
      var previous = R.prop(where, selection);
      var new_selection = R.difference(previous, stamps);
      var ret = R.assoc(where, new_selection, selection);

      checkSelection(where, state);

      R.forEach(emitChangeEvent$(state), R.uniq(R.concat(previous, stamps)));

      return ret;
    }
    function terrainSelectionClear(where, state, selection) {
      var previous = R.prop(where, selection);
      return gameTerrainSelectionModel.removeFrom(where, previous, state, selection);
    }
    function checkSelection(where, state) {
      if ('local' === where) {
        state.queueEventP('Modes.switchTo', 'Default');
        state.queueChangeEventP('Game.terrain.selection.local.change');
      }
    }
    function emitChangeEvent(state, stamp) {
      state.queueChangeEventP('Game.terrain.change.' + stamp);
    }
  }
})();
//# sourceMappingURL=terrainSelection.js.map
