'use strict';

(function () {
  angular.module('clickApp.services').factory('setLosCommand', setLosCommandModelFactory);

  setLosCommandModelFactory.$inject = ['setSegmentCommand', 'commands', 'gameLos'];
  function setLosCommandModelFactory(setSegmentCommandModel, commandsModel, gameLosModel) {
    var base = setSegmentCommandModel('los', gameLosModel);
    var setLosCommandModel = Object.create(base);

    commandsModel.registerCommand('setLos', setLosCommandModel);
    return setLosCommandModel;
  }
})();
//# sourceMappingURL=los.js.map
