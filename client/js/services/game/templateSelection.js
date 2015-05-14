'use strict';

self.gameTemplateSelectionServiceFactory = function gameTemplateSelectionServiceFactory(modesService,
                                                                                        gameTemplatesService) {
  var gameTemplateSelectionService = {
    create: function templateSelectionCreate() {
      return {
        local: { stamps: [] },
      };
    },
    inLocal: function templateSelectionInLocal(stamp, selection) {
      var local = R.path(['local','stamps'], selection);
      return R.find(R.eq(stamp), local);
    },
    getLocal: function templateSelectionGetLocal(selection) {
      return R.path(['local','stamps'], selection)[0];
    },
    setLocal: function templateSelectionSetLocal(stamp, scope, selection) {
      var previous_selection = gameTemplateSelectionService.getLocal(selection);
      selection.local = R.assoc('stamps', [stamp], selection.local);
      var mode = (gameTemplatesService.isLocked(stamp, scope.game.templates) ?
                  'TemplateLocked' : 'Template');
      modesService.switchToMode(mode, scope, scope.modes);
      scope.gameEvent('changeTemplate-'+stamp);
      if(R.exists(previous_selection)) {
        scope.gameEvent('changeTemplate-'+previous_selection);
      }
    },
    removeFromLocal: function templateSelectionRemoveFromLocal(stamp, scope, selection) {
      if(gameTemplateSelectionService.inLocal(stamp, selection)) {
        selection.local = R.assoc('stamps', [], selection.local);
        modesService.switchToMode('Default', scope, scope.modes);
        scope.gameEvent('changeTemplate-'+stamp);
      }
    },
    clearLocal: function templateSelectionRemoveFromLocal(scope, selection) {
      var previous_selection = gameTemplateSelectionService.getLocal(selection);
      selection.local = R.assoc('stamps', [], selection.local);
      modesService.switchToMode('Default', scope, scope.modes);
      if(R.exists(previous_selection)) {
        scope.gameEvent('changeTemplate-'+previous_selection);
      }
    },
  };
  return gameTemplateSelectionService;
};
