'use strict';

self.gameTemplateSelectionServiceFactory = function gameTemplateSelectionServiceFactory(modesService,
                                                                                        gameTemplatesService) {
  var gameTemplateSelectionService = {
    create: function templateSelectionCreate() {
      return {
        local: { stamps: [] },
        remote: { stamps: [] },
      };
    },
    'in': function templateSelectionIn(where, stamp, selection) {
      var stamps = R.path([where,'stamps'], selection);
      return R.find(R.eq(stamp), stamps);
    },
    inSingle: function templateSelectionIn(where, stamp, selection) {
      var stamps = R.path([where,'stamps'], selection);
      return ( R.length(stamps) === 1 &&
               stamp === stamps[0]
             );
    },
    get: function templateSelectionGet(where, selection) {
      return R.defaultTo([], R.path([where,'stamps'], selection));
    },
    checkMode: function templateSelectionCheckMode(scope, selection) {
      var stamp = R.head(gameTemplateSelectionService.get('local', selection));
      if(R.exists(stamp)) {
        var mode = gameTemplatesService.modeForStamp(stamp, scope.game.templates);
        modesService.switchToMode(mode, scope, scope.modes);
        return true;
      }
      else {
        modesService.switchToMode('Default', scope, scope.modes);
      }
      return false;
    },
    set: function templateSelectionSet(where, stamps, scope, selection) {
      var previous = gameTemplateSelectionService.get(where, selection);
      var ret = R.assocPath([where, 'stamps'], stamps, selection);

      if('local' === where) {
        var mode = gameTemplateSelectionService.checkMode(scope, ret);
        checkSingleSelection(scope, ret);
      }
      
      R.forEach(function(stamp) {
        scope.gameEvent('changeTemplate-'+stamp);
      }, stamps);
      R.forEach(function(stamp) {
        scope.gameEvent('changeTemplate-'+stamp);
      }, previous);

      return ret;
    },
    removeFrom: function templateSelectionRemoveFrom(where, stamps, scope, selection) {
      var path = [where, 'stamps'];
      var previous = R.path(path, selection);
      var new_selection = R.difference(previous, stamps);
      var ret = R.assocPath(path, new_selection, selection);
      
      if('local' === where) {
        gameTemplateSelectionService.checkMode(scope, ret);
        checkSingleSelection(scope, ret);
      }

      R.forEach(function(stamp) {
        scope.gameEvent('changeTemplate-'+stamp);
      }, R.uniq(R.concat(previous, stamps)));

      return ret;
    },
    clear: function templateSelectionClear(where, scope, selection) {
      var path = [where, 'stamps'];
      var previous = R.path(path, selection);
      return gameTemplateSelectionService.removeFrom(where, previous, scope, selection);
    },
  };
  function checkSingleSelection(scope, selection) {
    if(R.length(R.path(['local','stamps'], selection)) !== 1) {
      scope.gameEvent('disableSingleAoESelection');
    }
  }
  R.curryService(gameTemplateSelectionService);
  return gameTemplateSelectionService;
};
