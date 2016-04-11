'use strict';

(function () {
  angular.module('clickApp.models').factory('gameTemplateSelection', gameTemplateSelectionModelFactory);

  gameTemplateSelectionModelFactory.$inject = ['appState', 'gameElementSelection', 'gameTemplates'];
  function gameTemplateSelectionModelFactory(appStateService, gameElementSelectionModel, gameTemplatesModel) {
    var base = gameElementSelectionModel('template');
    var gameTemplateSelectionModel = Object.create(base);
    R.deepExtend(gameTemplateSelectionModel, {
      checkMode: templateSelectionCheckMode
    });
    R.curryService(gameTemplateSelectionModel);
    return gameTemplateSelectionModel;

    function templateSelectionCheckMode(selection) {
      var state = appStateService.current();
      return R.thread(selection)(gameTemplateSelectionModel.get$('local'), R.ifElse(R.isEmpty, function () {
        return null;
      }, function (local) {
        return R.thread(local)(R.head, gameTemplatesModel.findStamp$(R.__, state.game.templates), function (template) {
          return template.state.type + 'Template';
        });
      }));
    }
  }
})();
//# sourceMappingURL=templateSelection.js.map
