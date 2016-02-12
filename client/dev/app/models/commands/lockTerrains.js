'use strict';

angular.module('clickApp.services').factory('lockTerrainsCommand', ['commands', 'gameTerrains', function lockTerrainsCommandServiceFactory(commandsService, gameTerrainsService) {
  var lockTerrainsCommandService = {
    execute: function lockTerrainsExecute(lock, stamps, state, game) {
      var ctxt = {
        desc: lock,
        stamps: stamps
      };

      return R.pipeP(gameTerrainsService.lockStamps$(lock, stamps), function (game_terrains) {
        game = R.assoc('terrains', game_terrains, game);

        R.forEach(function (stamp) {
          state.changeEvent('Game.terrain.change.' + stamp);
        }, stamps);
        state.changeEvent('Game.terrain.create');

        return [ctxt, game];
      })(game.terrains);
    },
    replay: function lockTerrainsRedo(ctxt, state, game) {
      return R.pipeP(gameTerrainsService.lockStamps$(ctxt.desc, ctxt.stamps), function (game_terrains) {
        game = R.assoc('terrains', game_terrains, game);

        R.forEach(function (stamp) {
          state.changeEvent('Game.terrain.change.' + stamp);
        }, ctxt.stamps);
        state.changeEvent('Game.terrain.create');

        return game;
      })(game.terrains);
    },
    undo: function lockTerrainsUndo(ctxt, state, game) {
      return R.pipeP(gameTerrainsService.lockStamps$(!ctxt.desc, ctxt.stamps), function (game_terrains) {
        game = R.assoc('terrains', game_terrains, game);

        R.forEach(function (stamp) {
          state.changeEvent('Game.terrain.change.' + stamp);
        }, ctxt.stamps);
        state.changeEvent('Game.terrain.create');

        return game;
      })(game.terrains);
    }
  };
  commandsService.registerCommand('lockTerrains', lockTerrainsCommandService);
  return lockTerrainsCommandService;
}]);
//# sourceMappingURL=lockTerrains.js.map