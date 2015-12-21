angular.module('clickApp.services')
  .factory('gameTerrainSelection', [
    function gameTerrainSelectionServiceFactory() {
      var gameTerrainSelectionService = {
        create: function terrainSelectionCreate() {
          return {
            local: [],
            remote: [],
          };
        },
        'in': function terrainSelectionIn(where, stamp, selection) {
          var stamps = R.prop(where, selection);
          return R.find(R.equals(stamp), stamps);
        },
        get: function terrainSelectionGet(where, selection) {
          return R.pipe(
            R.defaultTo({}),
            R.propOr([], where)
          )(selection);
        },
        checkMode: function terrainSelectionCheckMode(scope, selection) {
          return R.pipePromise(
            gameTerrainSelectionService.get$('local'),
            R.head,
            (stamp) => {
              if(R.isNil(stamp)) {
                return self.Promise.reject('No terrain selection');
              }

              return scope.doSwitchToMode('Terrain');
            }
          )(selection);
        },
        set: function terrainSelectionSet(where, stamps, scope, selection) {
          var previous = gameTerrainSelectionService.get(where, selection);
          var ret = R.assoc(where, stamps, selection);

          if('local' === where) {
            scope.doSwitchToMode('Default');
          }
          
          R.forEach(function(stamp) {
            scope.gameEvent('changeTerrain-'+stamp);
          }, stamps);
          R.forEach(function(stamp) {
            scope.gameEvent('changeTerrain-'+stamp);
          }, previous);

          return ret;
        },
        addTo: function terrainSelectionSet(where, stamps, scope, selection) {
          var previous = gameTerrainSelectionService.get(where, selection);
          var new_selection = R.uniq(R.concat(previous, stamps));
          var ret = R.assoc(where, new_selection, selection);

          if('local' === where) {
            scope.doSwitchToMode('Default');
          }
          
          R.forEach(function(stamp) {
            scope.gameEvent('changeTerrain-'+stamp);
          }, new_selection);

          return ret;
        },
        removeFrom: function terrainSelectionRemoveFrom(where, stamps, scope, selection) {
          var previous = R.prop(where, selection);
          var new_selection = R.difference(previous, stamps);
          var ret = R.assoc(where, new_selection, selection);
          
          if('local' === where) {
            scope.doSwitchToMode('Default');
          }

          R.forEach(function(stamp) {
            scope.gameEvent('changeTerrain-'+stamp);
          }, R.uniq(R.concat(previous, stamps)));

          return ret;
        },
        clear: function terrainSelectionClear(where, scope, selection) {
          var previous = R.prop(where, selection);
          return gameTerrainSelectionService
            .removeFrom(where, previous, scope, selection);
        },
      };
      R.curryService(gameTerrainSelectionService);
      return gameTerrainSelectionService;
    }
  ]);
