'use strict';

(function () {
  angular.module('clickApp.models').factory('lockTemplatesCommand', lockTemplatesCommandModelFactory);

  lockTemplatesCommandModelFactory.$inject = ['lockElementsCommand', 'commands', 'gameTemplates'];
  function lockTemplatesCommandModelFactory(lockElementsCommandModel, commandsModel, gameTemplatesModel) {
    var lockTemplatesCommandModel = lockElementsCommandModel('template', gameTemplatesModel);
    commandsModel.registerCommand('lockTemplates', lockTemplatesCommandModel);
    return lockTemplatesCommandModel;
  }
})();
//# sourceMappingURL=templates.js.map
