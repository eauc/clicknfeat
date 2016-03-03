'use strict';

(function () {
  angular.module('clickApp.models').factory('gameTemplateSelection', gameTemplateSelectionModelFactory);

  gameTemplateSelectionModelFactory.$inject = ['gameElementSelection', 'gameTemplates'];
  function gameTemplateSelectionModelFactory(gameElementSelectionModel, gameTemplatesModel) {
    var base = gameElementSelectionModel('template');
    var gameTemplateSelectionModel = Object.create(base);
    R.deepExtend(gameTemplateSelectionModel, {
      checkModeP: templateSelectionCheckModeP
    });
    R.curryService(gameTemplateSelectionModel);
    return gameTemplateSelectionModel;

    function templateSelectionCheckModeP(state, selection) {
      return R.threadP(selection)(gameTemplateSelectionModel.get$('local'), R.head, R.rejectIf(R.isNil, 'No template selection'), R.spyError('stamp'), function (stamp) {
        return gameTemplatesModel.findStampP(stamp, state.game.templates);
      }, function (template) {
        console.error(template);
        state.queueEventP('Modes.switchTo', template.state.type + 'Template');
      });
    }
  }
})();
//# sourceMappingURL=templateSelection.js.map
