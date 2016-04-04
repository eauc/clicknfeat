(function() {
  angular.module('clickApp.services')
    .factory('lockElementsCommand', lockElementsCommandModelFactory);

  lockElementsCommandModelFactory.$inject = [];
  function lockElementsCommandModelFactory() {
    return function buildLockElementsCommandModel(type,
                                                  gameElementsModel) {
      const lockElementsCommandModel = {
        executeP: lockElementsExecuteP,
        replayP: lockElementsRedoP,
        undoP: lockElementsUndoP
      };
      const lockStamps$ = R.curry(lockStamps);
      return lockElementsCommandModel;

      function lockElementsExecuteP(lock, stamps, game) {
        const ctxt = {
          desc: lock,
          stamps: stamps
        };

        return R.thread(game)(
          lockStamps$(lock, stamps),
          (game) => [ctxt, game]
        );
      }
      function lockElementsRedoP(ctxt, game) {
        return lockStamps(ctxt.desc, ctxt.stamps, game);
      }
      function lockElementsUndoP(ctxt, game) {
        return lockStamps(!ctxt.desc, ctxt.stamps, game);
      }
      function lockStamps(lock, stamps, game) {
        return R.over(
          R.lensProp(`${type}s`),
          gameElementsModel.lockStamps$(lock, stamps),
          game
        );
      }
    };
  }
})();
