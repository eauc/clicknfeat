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
    get: function templateSelectionGet(where, selection) {
      return R.defaultTo([], R.path([where,'stamps'], selection))[0];
    },
    checkMode: function templateSelectionCheckMode(scope, selection) {
      var stamp = gameTemplateSelectionService.get('local', selection);
      if(R.exists(stamp)) {
        var mode = gameTemplatesService.modeForStamp(stamp, scope.game.templates);
        modesService.switchToMode(mode, scope, scope.modes);
        return true;
      }
      return false;
    },
    set: function templateSelectionSet(where, stamp, scope, selection) {
      var previous_selection = gameTemplateSelectionService.get(where, selection);
      var ret = R.pipe(
        R.prop(where),
        R.assoc('stamps', [stamp]),
        function(sel) {
          return R.assoc(where, sel, selection);
        }
      )(selection);

      if('local' === where) {
        var mode = gameTemplatesService.modeForStamp(stamp, scope.game.templates);
        modesService.switchToMode(mode, scope, scope.modes);
      }
      
      scope.gameEvent('changeTemplate-'+stamp);
      if(R.exists(previous_selection)) {
        scope.gameEvent('changeTemplate-'+previous_selection);
      }

      return ret;
    },
    removeFrom: function templateSelectionRemoveFrom(where, stamp, scope, selection) {
      var ret = selection;
      if(gameTemplateSelectionService.in(where, stamp, selection)) {
        ret = R.pipe(
          R.prop(where),
          R.assoc('stamps', []),
          function(sel) {
            return R.assoc(where, sel, selection);
          }
        )(selection);

        if('local' === where) {
          modesService.switchToMode('Default', scope, scope.modes);
        }

        scope.gameEvent('changeTemplate-'+stamp);
      }
      return ret;
    },
    clear: function templateSelectionClear(where, scope, selection) {
      var previous_selection = gameTemplateSelectionService.get(where, selection);
      var ret = R.pipe(
        R.prop(where),
        R.assoc('stamps', []),
        function(sel) {
          return R.assoc(where, sel, selection);
        }
      )(selection);

      if('local' === where) {
        modesService.switchToMode('Default', scope, scope.modes);
      }

      if(R.exists(previous_selection)) {
        scope.gameEvent('changeTemplate-'+previous_selection);
      }
      return ret;
    },
  };
  return gameTemplateSelectionService;
};
