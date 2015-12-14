'use strict';

angular.module('clickApp.services').factory('rollDeviationCommand', ['commands', function rollDeviationCommandServiceFactory(commandsService) {
  var rollDeviationCommandService = {
    execute: function rollDeviationExecute(scope, game) {
      var direction = R.randomRange(1, 6);
      var distance = R.randomRange(1, 6);

      var ctxt = {
        desc: 'AoE deviation : direction ' + direction + ', distance ' + distance + '"',
        r: direction,
        d: distance
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
  commandsService.registerCommand('rollDeviation', rollDeviationCommandService);
  return rollDeviationCommandService;
}]);
//# sourceMappingURL=rollDeviation.js.map