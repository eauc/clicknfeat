(function() {
  angular.module('clickApp.services')
    .factory('rollDiceCommand', rollDiceCommandModelFactory);

  rollDiceCommandModelFactory.$inject = [
    'commands',
  ];
  function rollDiceCommandModelFactory(commandsModel) {
    const rollDiceCommandModel = {
      executeP: rollDiceExecuteP,
      replayP: rollDiceReplayP,
      undoP: rollDiceUndoP
    };
    commandsModel.registerCommand('rollDice', rollDiceCommandModel);
    return rollDiceCommandModel;

    function rollDiceExecuteP(sides, nb_dice, game) {
      const dice = R.times(() => {
        return R.randomRange(1, sides);
      }, nb_dice);
      const total = R.reduce(R.add, 0, dice);
      const ctxt = {
        desc: `d${sides}[${dice.join(',')}] = ${total}`,
        s: sides,
        n: nb_dice,
        d: dice
      };
      return [ctxt, game];
    }
    function rollDiceReplayP(_ctxt_, game) {
      return game;
    }
    function rollDiceUndoP(_ctxt_, game) {
      return game;
    }
  }
})();
