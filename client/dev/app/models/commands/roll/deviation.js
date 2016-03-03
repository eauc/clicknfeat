'use strict';

(function () {
  angular.module('clickApp.services').factory('rollDeviationCommand', rollDeviationCommandModelFactory);

  rollDeviationCommandModelFactory.$inject = ['commands'];
  function rollDeviationCommandModelFactory(commandsModel) {
    var rollDeviationCommandModel = {
      executeP: rollDeviationExecuteP,
      replayP: rollDiceRedoP,
      undoP: rollDiceUndoP
    };

    commandsModel.registerCommand('rollDeviation', rollDeviationCommandModel);
    return rollDeviationCommandModel;

    function rollDeviationExecuteP(state, game) {
      var direction = R.randomRange(1, 6);
      var distance = R.randomRange(1, 6);

      var ctxt = {
        desc: 'AoE deviation : direction ' + direction + ', distance ' + distance + '"',
        r: direction,
        d: distance
      };

      state.queueChangeEventP('Game.dice.roll');

      return [ctxt, game];
    }
    function rollDiceRedoP(ctxt, state, game) {
      var dice = R.propOr([], 'dice', game);
      game = R.assoc('dice', R.append(ctxt, dice), game);

      state.queueChangeEventP('Game.dice.roll');

      return game;
    }
    function rollDiceUndoP(ctxt, state, game) {
      var dice = R.propOr([], 'dice', game);
      game = R.assoc('dice', R.reject(R.propEq('stamp', ctxt.stamp), dice), game);

      state.queueChangeEventP('Game.dice.roll');

      return game;
    }
  }
})();
//# sourceMappingURL=deviation.js.map
