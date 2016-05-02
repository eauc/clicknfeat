(function() {
  angular.module('clickApp.services')
    .factory('losMode', losModeModelFactory);

  losModeModelFactory.$inject = [
    'appState',
    'segmentMode',
    'gameLos',
  ];
  function losModeModelFactory(appStateService,
                               segmentModeModel,
                               gameLosModel) {
    const los_default_bindings = {
      exitLosMode: 'ctrl+l',
      toggleIgnoreModel: 'clickModel',
      setOriginModel: 'ctrl+clickModel',
      setTargetModel: 'shift+clickModel'
    };
    const los_mode = segmentModeModel('los', gameLosModel, los_default_bindings);
    los_mode.actions.setOriginModel = losSetOriginModel;
    los_mode.actions.setTargetModel = losSetTargetModel;
    los_mode.actions.toggleIgnoreModel = losToggleIgnoreModel;

    return los_mode;

    function losSetOriginModel(_state_, event) {
      return appStateService
        .chainReduce('Game.command.execute',
                     'setLos', [
                       'setOrigin',
                       [event['click#'].target]
                     ]);
    }
    function losSetTargetModel(_state_, event) {
      return appStateService
        .chainReduce('Game.command.execute',
                     'setLos', [
                       'setTarget',
                       [event['click#'].target]
                     ]);
    }
    function losToggleIgnoreModel(_state_, event) {
      return appStateService
        .chainReduce('Game.command.execute',
                     'setLos', [
                       'toggleIgnoreModel',
                       [event['click#'].target]
                     ]);
    }
  }
})();
