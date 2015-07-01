'use strict';

self.gameModelSelectionServiceFactory = function gameModelSelectionServiceFactory(modesService,
                                                                                  gameModelsService) {
  var gameModelSelectionService = {
    create: function modelSelectionCreate() {
      return {
        local: { stamps: [] },
        remote: { stamps: [] },
      };
    },
    'in': function modelSelectionIn(where, stamp, selection) {
      var stamps = R.path([where,'stamps'], selection);
      return R.find(R.eq(stamp), stamps);
    },
    inSingle: function modelSelectionInSingle(where, stamp, selection) {
      var stamps = R.path([where,'stamps'], selection);
      return ( R.length(stamps) === 1 &&
               stamps[0] === stamp );
    },
    get: function modelSelectionGet(where, selection) {
      return R.defaultTo([], R.path([where,'stamps'], selection));
    },
    modeFor: function(selection) {
      var local = gameModelSelectionService.get('local', selection);
      if(R.isEmpty(local)) {
        return 'Default';
      }
      if(R.length(local) === 1) {
        return 'Model';
      }
      return 'Models';
    },
    checkMode: function modelSelectionCheckMode(scope, selection) {
      var mode = gameModelSelectionService.modeFor(selection);
      modesService.switchToMode(mode, scope, scope.modes);
      return false;
    },
    set: function modelSelectionSet(where, stamps, scope, selection) {
      var previous = gameModelSelectionService.get(where, selection);
      var ret = R.assocPath([where, 'stamps'], stamps, selection);

      if('local' === where) {
        gameModelSelectionService.checkMode(scope, ret);
        checkSingleSelection(scope, ret);
      }
      
      R.forEach(function(stamp) {
        scope.gameEvent('changeModel-'+stamp);
      }, stamps);
      R.forEach(function(stamp) {
        scope.gameEvent('changeModel-'+stamp);
      }, previous);

      return ret;
    },
    addTo: function modelSelectionSet(where, stamps, scope, selection) {
      var previous = gameModelSelectionService.get(where, selection);
      var new_selection = R.uniq(R.concat(previous, stamps));
      var ret = R.assocPath([where, 'stamps'],
                            new_selection,
                            selection
                           );

      if('local' === where) {
        gameModelSelectionService.checkMode(scope, ret);
        checkSingleSelection(scope, ret);
      }
      
      R.forEach(function(stamp) {
        scope.gameEvent('changeModel-'+stamp);
      }, new_selection);

      return ret;
    },
    removeFrom: function modelSelectionRemoveFrom(where, stamps, scope, selection) {
      var path = [where, 'stamps'];
      var previous = R.path(path, selection);
      var new_selection = R.difference(previous, stamps);
      var ret = R.assocPath(path, new_selection, selection);
      
      if('local' === where) {
        gameModelSelectionService.checkMode(scope, ret);
        checkSingleSelection(scope, ret);
      }

      R.forEach(function(stamp) {
        scope.gameEvent('changeModel-'+stamp);
      }, R.uniq(R.concat(previous, stamps)));

      return ret;
    },
    clear: function modelSelectionClear(where, stamps, scope, selection) {
      var path = [where, 'stamps'];
      var previous = R.path(path, selection);
      return gameModelSelectionService.removeFrom(where, previous, scope, selection);
    },
  };
  function checkSingleSelection(scope, selection) {
    if(1 !== R.length(R.path(['local','stamps'], selection))) {
      scope.gameEvent('disableSingleModelSelection');
    }
  }
  R.curryService(gameModelSelectionService);
  return gameModelSelectionService;
};
