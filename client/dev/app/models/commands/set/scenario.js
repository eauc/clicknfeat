'use strict';

(function () {
  angular.module('clickApp.services').factory('setScenarioCommand', setScenarioCommandModelFactory);

  setScenarioCommandModelFactory.$inject = ['commands'];
  function setScenarioCommandModelFactory(commandsModel) {
    var setScenarioCommandModel = {
      executeP: setScenarioExecuteP,
      replayP: setScenarioReplayP,
      undoP: setScenarioUndoP
    };
    commandsModel.registerCommand('setScenario', setScenarioCommandModel);
    return setScenarioCommandModel;

    function setScenarioExecuteP(scenario, state, game) {
      var ctxt = {
        before: game.scenario,
        after: scenario,
        desc: scenario.name
      };
      game = R.assoc('scenario', scenario, game);

      state.queueChangeEventP('Game.scenario.change');

      return [ctxt, game];
    }
    function setScenarioReplayP(ctxt, state, game) {
      game = R.assoc('scenario', ctxt.after, game);

      state.queueChangeEventP('Game.scenario.change');

      return game;
    }
    function setScenarioUndoP(ctxt, state, game) {
      game = R.assoc('scenario', ctxt.before, game);

      state.queueChangeEventP('Game.scenario.change');

      return game;
    }
  }
})();
//# sourceMappingURL=scenario.js.map
