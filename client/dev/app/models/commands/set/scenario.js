'use strict';

angular.module('clickApp.services').factory('setScenarioCommand', ['commands', function setScenarioCommandServiceFactory(commandsService) {
  var setScenarioCommandService = {
    execute: function setScenarioExecute(scenario, state, game) {
      var ctxt = {
        before: game.scenario,
        after: scenario,
        desc: scenario.name
      };
      game = R.assoc('scenario', scenario, game);

      state.changeEvent('Game.scenario.change');

      return [ctxt, game];
    },
    replay: function setScenarioRedo(ctxt, state, game) {
      game = R.assoc('scenario', ctxt.after, game);

      state.changeEvent('Game.scenario.change');

      return game;
    },
    undo: function setScenarioUndo(ctxt, state, game) {
      game = R.assoc('scenario', ctxt.before, game);

      state.changeEvent('Game.scenario.change');

      return game;
    }
  };
  commandsService.registerCommand('setScenario', setScenarioCommandService);
  return setScenarioCommandService;
}]);
//# sourceMappingURL=scenario.js.map
