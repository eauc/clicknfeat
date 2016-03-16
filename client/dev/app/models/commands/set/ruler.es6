(function() {
  angular.module('clickApp.services')
    .factory('setRulerCommand', setRulerCommandModelFactory);

  setRulerCommandModelFactory.$inject = [
    'setSegmentCommand',
    'commands',
    'gameRuler',
  ];
  function setRulerCommandModelFactory(setSegmentCommandModel,
                                       commandsModel,
                                       gameRulerModel) {
    const base = setSegmentCommandModel('ruler', gameRulerModel);
    const setRulerCommandModel = Object.create(base);

    commandsModel.registerCommand('setRuler', setRulerCommandModel);
    return setRulerCommandModel;
  }
})();
