'use strict';

angular.module('clickApp.services').factory('gameTerrainSelection', [function gameTerrainSelectionServiceFactory() {
  function checkSelection(where, state) {
    if ('local' === where) {
      state.event('Modes.switchTo', 'Default');
      state.changeEvent('Game.terrain.selection.local.change');
    }
  }
  var gameTerrainSelectionService = {
    create: function terrainSelectionCreate() {
      return {
        local: [],
        remote: []
      };
    },
    'in': function terrainSelectionIn(where, stamp, selection) {
      var stamps = R.prop(where, selection);
      return R.find(R.equals(stamp), stamps);
    },
    get: function terrainSelectionGet(where) {
      var selection = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      R.spyError('titi', arguments);
      return R.propOr([], where, selection);
    },
    checkMode: function terrainSelectionCheckMode(state, selection) {
      return R.pipePromise(function (selection) {
        return gameTerrainSelectionService.get('local', selection);
      }, R.head, function (stamp) {
        if (R.isNil(stamp)) {
          return self.Promise.reject('No terrain selection');
        }

        return state.event('Modes.switchTo', 'Terrain');
      })(selection);
    },
    set: function terrainSelectionSet(where, stamps, state, selection) {
      var previous = gameTerrainSelectionService.get(where, selection);
      var ret = R.assoc(where, stamps, selection);

      checkSelection(where, state);

      R.forEach(function (stamp) {
        state.changeEvent('Game.terrain.change.' + stamp);
      }, stamps);
      R.forEach(function (stamp) {
        state.changeEvent('Game.terrain.change.' + stamp);
      }, previous);

      return ret;
    },
    addTo: function terrainSelectionSet(where, stamps, state, selection) {
      var previous = gameTerrainSelectionService.get(where, selection);
      var new_selection = R.uniq(R.concat(previous, stamps));
      var ret = R.assoc(where, new_selection, selection);

      checkSelection(where, state);

      R.forEach(function (stamp) {
        state.changeEvent('Game.terrain.change.' + stamp);
      }, new_selection);

      return ret;
    },
    removeFrom: function terrainSelectionRemoveFrom(where, stamps, state, selection) {
      var previous = R.prop(where, selection);
      var new_selection = R.difference(previous, stamps);
      var ret = R.assoc(where, new_selection, selection);

      checkSelection(where, state);

      R.forEach(function (stamp) {
        state.changeEvent('Game.terrain.change.' + stamp);
      }, R.uniq(R.concat(previous, stamps)));

      return ret;
    },
    clear: function terrainSelectionClear(where, state, selection) {
      var previous = R.prop(where, selection);
      return gameTerrainSelectionService.removeFrom(where, previous, state, selection);
    }
  };
  R.curryService(gameTerrainSelectionService);
  return gameTerrainSelectionService;
}]);
//# sourceMappingURL=terrainSelection.js.map
