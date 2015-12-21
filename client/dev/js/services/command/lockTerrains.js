'use strict';

angular.module('clickApp.services').factory('lockTerrainsCommand', ['commands', 'gameTerrains', function lockTerrainsCommandServiceFactory(commandsService, gameTerrainsService) {
  var lockTerrainsCommandService = {
    execute: function lockTerrainsExecute(lock, stamps, scope, game) {
      var ctxt = {
        desc: lock,
        stamps: stamps
      };

      return R.pipeP(gameTerrainsService.lockStamps$(lock, stamps), function (game_terrains) {
        game.terrains = game_terrains;

        R.forEach(function (stamp) {
          scope.gameEvent('changeTerrain-' + stamp);
          scope.gameEvent('createTerrain');
        }, stamps);

        return ctxt;
      })(game.terrains);
    },
    replay: function lockTerrainsRedo(ctxt, scope, game) {
      return R.pipeP(gameTerrainsService.lockStamps$(ctxt.desc, ctxt.stamps), function (game_terrains) {
        game.terrains = game_terrains;

        R.forEach(function (stamp) {
          scope.gameEvent('changeTerrain-' + stamp);
          scope.gameEvent('createTerrain');
        }, ctxt.stamps);
      })(game.terrains);
    },
    undo: function lockTerrainsUndo(ctxt, scope, game) {
      return R.pipeP(gameTerrainsService.lockStamps$(!ctxt.desc, ctxt.stamps), function (game_terrains) {
        game.terrains = game_terrains;

        R.forEach(function (stamp) {
          scope.gameEvent('changeTerrain-' + stamp);
          scope.gameEvent('createTerrain');
        }, ctxt.stamps);
      })(game.terrains);
    }
  };
  commandsService.registerCommand('lockTerrains', lockTerrainsCommandService);
  return lockTerrainsCommandService;
}]);
//# sourceMappingURL=lockTerrains.js.map
