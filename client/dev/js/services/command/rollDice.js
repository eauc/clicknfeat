'use strict';

angular.module('clickApp.services').factory('rollDiceCommand', ['commands', function rollDiceCommandServiceFactory(commandsService) {
  var rollDiceCommandService = {
    execute: function rollDiceExecute(sides, nb_dice, scope, game) {
      var dices = R.times(function () {
        return R.randomRange(1, sides);
      }, nb_dice);
      var total = R.reduce(R.add, 0, dices);
      var ctxt = {
        desc: 'd' + sides + '[' + dices.join(',') + '] =  ' + total,
        s: sides,
        n: nb_dice,
        d: dices
      };
      game.dice = R.append(ctxt, game.dice);
      scope.gameEvent('diceRoll');
      return ctxt;
    },
    replay: function rollDiceRedo(ctxt, scope, game) {
      game.dice = R.append(ctxt, game.dice);
      scope.gameEvent('diceRoll');
    },
    undo: function rollDiceUndo(ctxt, scope, game) {
      game.dice = R.reject(R.propEq('stamp', ctxt.stamp), game.dice);
      scope.gameEvent('diceRoll');
    }
  };
  commandsService.registerCommand('rollDice', rollDiceCommandService);
  return rollDiceCommandService;
}]);
//# sourceMappingURL=rollDice.js.map