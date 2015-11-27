'use strict';

angular.module('clickApp.services')
  .factory('gameModelSelection', [
    'modes',
    'gameModels',
    'model',
    function gameModelSelectionServiceFactory(modesService,
                                              gameModelsService,
                                              modelService) {
      var gameModelSelectionService = {
        create: function modelSelectionCreate() {
          return {
            local: [],
            remote: [],
          };
        },
        'in': function modelSelectionIn(where, stamp, selection) {
          var stamps = R.prop(where, selection);
          return R.find(R.equals(stamp), stamps);
        },
        inSingle: function modelSelectionInSingle(where, stamp, selection) {
          var stamps = R.prop(where, selection);
          return ( R.length(stamps) === 1 &&
                   stamps[0] === stamp );
        },
        get: function modelSelectionGet(where, selection) {
          return R.defaultTo([], R.prop(where, selection));
        },
        modeFor: function(models, selection) {
          var local = gameModelSelectionService.get('local', selection);
          if(R.isEmpty(local)) {
            return self.Promise.reject('No model selection');
          }
          if(R.length(local) === 1) {
            return gameModelsService.modeForStamp(local[0], models);
          }
          return 'Models';
        },
        checkMode: function modelSelectionCheckMode(scope, selection) {
          return self.Promise.resolve(gameModelSelectionService
                                      .modeFor(scope.game.models, selection))
            .then(function(mode) {
              return scope.doSwitchToMode(mode);
            });
        },
        set: function modelSelectionSet(where, stamps, scope, selection) {
          var previous = gameModelSelectionService.get(where, selection);
          var ret = R.assoc(where, stamps, selection);

          if('local' === where) {
            scope.doSwitchToMode('Default');
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
          var ret = R.assoc(where, new_selection, selection);

          if('local' === where) {
            scope.doSwitchToMode('Default');
            checkSingleSelection(scope, ret);
          }
          
          R.forEach(function(stamp) {
            scope.gameEvent('changeModel-'+stamp);
          }, new_selection);

          return ret;
        },
        removeFrom: function modelSelectionRemoveFrom(where, stamps, scope, selection) {
          var previous = R.prop(where, selection);
          var new_selection = R.difference(previous, stamps);
          var ret = R.assoc(where, new_selection, selection);
          
          if('local' === where) {
            scope.doSwitchToMode('Default');
            checkSingleSelection(scope, ret);
          }

          R.forEach(function(stamp) {
            scope.gameEvent('changeModel-'+stamp);
          }, R.uniq(R.concat(previous, stamps)));

          return ret;
        },
        clear: function modelSelectionClear(where, stamps, scope, selection) {
          var previous = R.prop(where, selection);
          return gameModelSelectionService.removeFrom(where, previous, scope, selection);
        },
      };
      function checkSingleSelection(scope, selection) {
        if(1 !== R.length(R.prop('local', selection))) {
          scope.gameEvent('disableSingleModelSelection');
        }
      }
      R.curryService(gameModelSelectionService);
      return gameModelSelectionService;
    }
  ]);
