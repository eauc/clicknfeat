'use strict';

angular.module('clickApp.services').factory('setScenarioCommand', ['commands', function setScenarioCommandServiceFactory(commandsService) {
  var setScenarioCommandService = {
    execute: function setScenarioExecute(scenario, scope, game) {
      var ctxt = {
        before: game.scenario,
        after: scenario,
        desc: scenario.name
      };
      game.scenario = scenario;
      scope.gameEvent('changeScenario');
      return ctxt;
    },
    replay: function setScenarioRedo(ctxt, scope, game) {
      game.scenario = ctxt.after;
      scope.gameEvent('changeScenario');
    },
    undo: function setScenarioUndo(ctxt, scope, game) {
      game.scenario = ctxt.before;
      scope.gameEvent('changeScenario');
    }
  };
  commandsService.registerCommand('setScenario', setScenarioCommandService);
  return setScenarioCommandService;
}]);
//# sourceMappingURL=setScenario.js.map
