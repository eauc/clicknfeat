'use strict';

(function () {
  angular.module('clickApp.models').factory('deleteTemplateCommand', deleteTemplatesCommandModelFactory);

  deleteTemplatesCommandModelFactory.$inject = ['deleteElementCommand', 'commands', 'template', 'gameTemplates', 'gameTemplateSelection'];
  function deleteTemplatesCommandModelFactory(deleteElementCommandModel, commandsModel, templateModel, gameTemplatesModel, gameTemplateSelectionModel) {
    var deleteTemplateCommandModel = deleteElementCommandModel('template', templateModel, gameTemplatesModel, gameTemplateSelectionModel);
    commandsModel.registerCommand('deleteTemplate', deleteTemplateCommandModel);
    return deleteTemplateCommandModel;
  }
})();
//# sourceMappingURL=template.js.map
