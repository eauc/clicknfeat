'use strict';

(function () {
  angular.module('clickApp.services').factory('losMode', losModeModelFactory);

  losModeModelFactory.$inject = ['appState', 'segmentMode', 'gameLos'];
  function losModeModelFactory(appStateService, segmentModeModel, gameLosModel) {
    var los_default_bindings = {
      exitLosMode: 'ctrl+l',
      toggleIgnoreModel: 'clickModel',
      setOriginModel: 'ctrl+clickModel',
      setTargetModel: 'shift+clickModel'
    };
    var los_mode = segmentModeModel('los', gameLosModel, los_default_bindings);
    los_mode.actions.setOriginModel = losSetOriginModel;
    los_mode.actions.setTargetModel = losSetTargetModel;
    los_mode.actions.toggleIgnoreModel = losToggleIgnoreModel;

    return los_mode;

    function losSetOriginModel(state, event) {
      return appStateService.onAction(state, ['Game.command.execute', 'setLos', ['setOrigin', [event['click#'].target]]]);
    }
    function losSetTargetModel(state, event) {
      return appStateService.onAction(state, ['Game.command.execute', 'setLos', ['setTarget', [event['click#'].target]]]);
    }
    function losToggleIgnoreModel(state, event) {
      return appStateService.onAction(state, ['Game.command.execute', 'setLos', ['toggleIgnoreModel', [event['click#'].target]]]);
    }
  }
})();
//# sourceMappingURL=los.js.map
