angular.module('clickApp.services')
  .factory('gameTerrainSelection', [
    function gameTerrainSelectionServiceFactory() {
      function checkSelection(where, state) {
        if('local' === where) {
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
        get: function terrainSelectionGet(where, selection = {}) {
          R.spyError('titi', arguments);
          return R.propOr([], where, selection);
        },
        checkMode: function terrainSelectionCheckMode(state, selection) {
          return R.pipePromise(
            (selection) => {
              return gameTerrainSelectionService.get('local', selection);
            },
            R.head,
            (stamp) => {
              if(R.isNil(stamp)) {
                return self.Promise.reject('No terrain selection');
              }

              return state.event('Modes.switchTo', 'Terrain');
            }
          )(selection);
        },
        set: function terrainSelectionSet(where, stamps, state, selection) {
          var previous = gameTerrainSelectionService.get(where, selection);
          var ret = R.assoc(where, stamps, selection);

          checkSelection(where, state);
          
          R.forEach((stamp) => {
            state.changeEvent(`Game.terrain.change.${stamp}`);
          }, stamps);
          R.forEach((stamp) => {
            state.changeEvent(`Game.terrain.change.${stamp}`);
          }, previous);

          return ret;
        },
        addTo: function terrainSelectionSet(where, stamps, state, selection) {
          var previous = gameTerrainSelectionService.get(where, selection);
          var new_selection = R.uniq(R.concat(previous, stamps));
          var ret = R.assoc(where, new_selection, selection);

          checkSelection(where, state);
          
          R.forEach((stamp) => {
            state.changeEvent(`Game.terrain.change.${stamp}`);
          }, new_selection);

          return ret;
        },
        removeFrom: function terrainSelectionRemoveFrom(where, stamps, state, selection) {
          var previous = R.prop(where, selection);
          var new_selection = R.difference(previous, stamps);
          var ret = R.assoc(where, new_selection, selection);
          
          checkSelection(where, state);

          R.forEach((stamp) => {
            state.changeEvent(`Game.terrain.change.${stamp}`);
          }, R.uniq(R.concat(previous, stamps)));

          return ret;
        },
        clear: function terrainSelectionClear(where, state, selection) {
          var previous = R.prop(where, selection);
          return gameTerrainSelectionService
            .removeFrom(where, previous, state, selection);
        }
      };
      R.curryService(gameTerrainSelectionService);
      return gameTerrainSelectionService;
    }
  ]);
