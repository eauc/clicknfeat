(function() {
  angular.module('clickApp.services')
    .factory('setScenarioCommand', setScenarioCommandModelFactory);

  setScenarioCommandModelFactory.$inject = [
    'commands',
  ];
  function setScenarioCommandModelFactory(commandsModel) {
    const setScenarioCommandModel = {
      executeP: setScenarioExecuteP,
      replayP: setScenarioReplayP,
      undoP: setScenarioUndoP
    };
    commandsModel.registerCommand('setScenario', setScenarioCommandModel);
    return setScenarioCommandModel;

    function setScenarioExecuteP(scenario, game) {
      var ctxt = {
        before: game.scenario,
        after: scenario,
        desc: scenario.name
      };
      game = R.assoc('scenario', scenario, game);
      return [ctxt, game];
    }
    function setScenarioReplayP(ctxt, game) {
      game = R.assoc('scenario', ctxt.after, game);
      return game;
    }
    function setScenarioUndoP(ctxt, game) {
      game = R.assoc('scenario', ctxt.before, game);
      return game;
    }
  }
})();
