'use strict';

(function () {
  angular.module('clickApp.models').factory('gameTemplateSelection', gameTemplateSelectionModelFactory);

  gameTemplateSelectionModelFactory.$inject = ['gameElementSelection', 'gameTemplates'];
  function gameTemplateSelectionModelFactory(gameElementSelectionModel, gameTemplatesModel) {
    var base = gameElementSelectionModel('template');
    var gameTemplateSelectionModel = Object.create(base);
    R.deepExtend(gameTemplateSelectionModel, {
      checkMode: templateSelectionCheckMode
    });
    R.curryService(gameTemplateSelectionModel);
    return gameTemplateSelectionModel;

    function templateSelectionCheckMode(templates, selection) {
      var local = gameTemplateSelectionModel.get('local', selection);
      if (R.isEmpty(local)) return null;

      var template = gameTemplatesModel.findStamp$(R.head(local), templates);
      if (R.isNil(template)) return null;

      return template.state.type + 'Template';
    }
  }
})();
//# sourceMappingURL=templateSelection.js.map
