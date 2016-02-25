'use strict';

(function () {
  angular.module('clickApp.services').factory('lockTerrainsCommand', lockTerrainsCommandModelFactory);

  lockTerrainsCommandModelFactory.$inject = ['commands', 'gameTerrains'];
  function lockTerrainsCommandModelFactory(commandsModel, gameTerrainsModel) {
    var lockTerrainsCommandModel = {
      executeP: lockTerrainsExecuteP,
      replayP: lockTerrainsRedoP,
      undoP: lockTerrainsUndoP
    };

    var lockStampsP$ = R.curry(lockStampsP);
    var emitChangeEvents$ = R.curry(emitChangeEvents);

    commandsModel.registerCommand('lockTerrains', lockTerrainsCommandModel);
    return lockTerrainsCommandModel;

    function lockTerrainsExecuteP(lock, stamps, state, game) {
      var ctxt = {
        desc: lock,
        stamps: stamps
      };

      return R.threadP(game)(lockStampsP$(lock, stamps), emitChangeEvents$(stamps, state), function (game) {
        return [ctxt, game];
      });
    }
    function lockTerrainsRedoP(ctxt, state, game) {
      return R.threadP(game)(lockStampsP$(ctxt.desc, ctxt.stamps), emitChangeEvents$(ctxt.stamps, state));
    }
    function lockTerrainsUndoP(ctxt, state, game) {
      return R.threadP(game)(lockStampsP$(!ctxt.desc, ctxt.stamps), emitChangeEvents$(ctxt.stamps, state));
    }
    function lockStampsP(lock, stamps, game) {
      return R.threadP(game.terrains)(gameTerrainsModel.lockStampsP$(lock, stamps), function (game_terrains) {
        return R.assoc('terrains', game_terrains, game);
      });
    }
    function emitChangeEvents(stamps, state, game) {
      R.forEach(function (stamp) {
        state.queueChangeEventP('Game.terrain.change.' + stamp);
      }, stamps);
      state.queueChangeEventP('Game.terrain.create');
      return game;
    }
  }
})();
//# sourceMappingURL=lockTerrains.js.map
