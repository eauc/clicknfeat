'use strict';

(function () {
  angular.module('clickApp.services').factory('setRulerCommand', setRulerCommandModelFactory);

  setRulerCommandModelFactory.$inject = ['setSegmentCommand', 'commands', 'gameRuler'];
  function setRulerCommandModelFactory(setSegmentCommandModel, commandsModel, gameRulerModel) {
    var base = setSegmentCommandModel('ruler', gameRulerModel);
    var setRulerCommandModel = Object.create(base);

    commandsModel.registerCommand('setRuler', setRulerCommandModel);
    return setRulerCommandModel;
  }
})();
//# sourceMappingURL=ruler.js.map
