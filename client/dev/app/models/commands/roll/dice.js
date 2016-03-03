'use strict';

angular.module('clickApp.services').factory('rollDiceCommand', ['commands', function rollDiceCommandServiceFactory(commandsService) {
  var rollDiceCommandService = {
    execute: function rollDiceExecute(sides, nb_dice, state, game) {
      var dices = R.times(function () {
        return R.randomRange(1, sides);
      }, nb_dice);
      var total = R.reduce(R.add, 0, dices);
      var ctxt = {
        desc: 'd' + sides + '[' + dices.join(',') + '] = ' + total,
        s: sides,
        n: nb_dice,
        d: dices
      };

      state.changeEvent('Game.dice.roll');

      return [ctxt, game];
    },
    replay: function rollDiceRedo(ctxt, state, game) {
      var dice = R.propOr([], 'dice', game);
      game = R.assoc('dice', R.append(ctxt, dice), game);

      state.changeEvent('Game.dice.roll');

      return game;
    },
    undo: function rollDiceUndo(ctxt, state, game) {
      var dice = R.propOr([], 'dice', game);
      game = R.assoc('dice', R.reject(R.propEq('stamp', ctxt.stamp), dice), game);

      state.changeEvent('Game.dice.roll');

      return game;
    }
  };
  commandsService.registerCommand('rollDice', rollDiceCommandService);
  return rollDiceCommandService;
}]);
//# sourceMappingURL=dice.js.map
