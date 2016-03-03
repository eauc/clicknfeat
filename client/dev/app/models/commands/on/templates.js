'use strict';

(function () {
  angular.module('clickApp.services').factory('onTemplatesCommand', onTemplatesCommandModelFactory);

  onTemplatesCommandModelFactory.$inject = ['onElementsCommand', 'commands', 'template', 'gameTemplates', 'gameTemplateSelection'];
  function onTemplatesCommandModelFactory(onElementsCommandModel, commandsModel, templateModel, gameTemplatesModel, gameTemplateSelectionModel) {
    var onTemplatesCommandModel = onElementsCommandModel('template', templateModel, gameTemplatesModel, gameTemplateSelectionModel, { checkIfModelRespondToMethod: false });
    commandsModel.registerCommand('onTemplates', onTemplatesCommandModel);
    return onTemplatesCommandModel;
  }
})();
//# sourceMappingURL=templates.js.map
