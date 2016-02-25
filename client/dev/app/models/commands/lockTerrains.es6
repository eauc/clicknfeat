(function() {
  angular.module('clickApp.services')
    .factory('lockTerrainsCommand', lockTerrainsCommandModelFactory);

  lockTerrainsCommandModelFactory.$inject = [
    'commands',
    'gameTerrains',
  ];
  function lockTerrainsCommandModelFactory(commandsModel,
                                           gameTerrainsModel) {
    const lockTerrainsCommandModel = {
      executeP: lockTerrainsExecuteP,
      replayP: lockTerrainsRedoP,
      undoP: lockTerrainsUndoP
    };

    const lockStampsP$ = R.curry(lockStampsP);
    const emitChangeEvents$ = R.curry(emitChangeEvents);

    commandsModel.registerCommand('lockTerrains', lockTerrainsCommandModel);
    return lockTerrainsCommandModel;

    function lockTerrainsExecuteP(lock, stamps, state, game) {
      const ctxt = {
        desc: lock,
        stamps: stamps
      };

      return R.threadP(game)(
        lockStampsP$(lock, stamps),
        emitChangeEvents$(stamps, state),
        (game) => {
          return [ctxt, game];
        }
      );
    }
    function lockTerrainsRedoP(ctxt, state, game) {
      return R.threadP(game)(
        lockStampsP$(ctxt.desc, ctxt.stamps),
        emitChangeEvents$(ctxt.stamps, state)
      );
    }
    function lockTerrainsUndoP(ctxt, state, game) {
      return R.threadP(game)(
        lockStampsP$(!ctxt.desc, ctxt.stamps),
        emitChangeEvents$(ctxt.stamps, state)
      );
    }
    function lockStampsP(lock, stamps, game) {
      return R.threadP(game.terrains)(
        gameTerrainsModel.lockStampsP$(lock, stamps),
        (game_terrains) => {
          return R.assoc('terrains', game_terrains, game);
        }
      );
    }
    function emitChangeEvents(stamps, state, game) {
      R.forEach((stamp) => {
        state.queueChangeEventP(`Game.terrain.change.${stamp}`);
      }, stamps);
      state.queueChangeEventP('Game.terrain.create');
      return game;
    }
  }
})();
