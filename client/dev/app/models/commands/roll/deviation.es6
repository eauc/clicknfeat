(function() {
  angular.module('clickApp.services')
    .factory('rollDeviationCommand', rollDeviationCommandModelFactory);

  rollDeviationCommandModelFactory.$inject = [
    'commands',
    'onTemplatesCommand',
  ];
  function rollDeviationCommandModelFactory(commandsModel,
                                            onTemplatesCommandModel) {
    const DICE_LENS = R.lensProp('dice');
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
      return R.threadP()(
        () => onTemplatesCommandModel
          .replayP(ctxt, game),
        R.over(DICE_LENS, R.pipe(R.defaultTo([]), R.append(ctxt)))
      );
    }
    function rollDiceUndoP(ctxt, game) {
      return R.threadP()(
        () => onTemplatesCommandModel
          .undoP(ctxt, game),
        R.over(DICE_LENS, R.pipe(R.defaultTo([]),
                                 R.reject(R.propEq('stamp', ctxt.stamp))))
      );
    }
  }
})();
