(function() {
  angular.module('clickApp.services')
    .factory('setLosCommand', setLosCommandModelFactory);

  setLosCommandModelFactory.$inject = [
    'setSegmentCommand',
    'commands',
    'gameLos',
  ];
  function setLosCommandModelFactory(setSegmentCommandModel,
                                     commandsModel,
                                     gameLosModel) {
    const base = setSegmentCommandModel('los', gameLosModel);
    const setLosCommandModel = Object.create(base);

    commandsModel.registerCommand('setLos', setLosCommandModel);
    return setLosCommandModel;
  }
})();
