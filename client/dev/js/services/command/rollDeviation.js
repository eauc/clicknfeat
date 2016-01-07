'use strict';

angular.module('clickApp.services').factory('rollDeviationCommand', ['commands', function rollDeviationCommandServiceFactory(commandsService) {
  var rollDeviationCommandService = {
    execute: function rollDeviationExecute(state, game) {
      var direction = R.randomRange(1, 6);
      var distance = R.randomRange(1, 6);

      var ctxt = {
        desc: 'AoE deviation : direction ' + direction + ', distance ' + distance + '"',
        r: direction,
        d: distance
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
  commandsService.registerCommand('rollDeviation', rollDeviationCommandService);
  return rollDeviationCommandService;
}]);
//# sourceMappingURL=rollDeviation.js.map
