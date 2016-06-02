(function() {
  angular.module('clickApp.services')
    .factory('rollDeviationCommand', rollDeviationCommandModelFactory);

  rollDeviationCommandModelFactory.$inject = [
    'commands',
    'onTemplatesCommand',
  ];
  function rollDeviationCommandModelFactory(commandsModel,
                                            onTemplatesCommandModel) {
    const rollDeviationCommandModel = {
      executeP: rollDeviationExecuteP,
      replayP: rollDiceReplayP,
      undoP: rollDiceUndoP
    };

    commandsModel.registerCommand('rollDeviation', rollDeviationCommandModel);
    return rollDeviationCommandModel;

    function rollDeviationExecuteP(stamps, game) {
      const direction = R.randomRange(1, 6);
      const distance = R.randomRange(1, 6);

      return R.threadP()(
        () => onTemplatesCommandModel
          .executeP('deviate', [ direction, distance ], stamps, game),
        ([ctxt, game]) => {
          ctxt = R.thread(ctxt)(
            R.assoc('desc',
                    `AoE deviation : direction ${direction}, distance ${distance}"`),
            R.assoc('r', direction),
            R.assoc('d', distance)
          );
          return [ctxt, game];
        }
      );
    }
    function rollDiceReplayP(ctxt, game) {
      return onTemplatesCommandModel
        .replayP(ctxt, game);
    }
    function rollDiceUndoP(ctxt, game) {
      return onTemplatesCommandModel
        .undoP(ctxt, game);
    }
  }
})();
