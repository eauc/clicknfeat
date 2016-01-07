'use strict';

angular.module('clickApp.services').factory('onTerrainsCommand', ['commands', 'terrain', 'gameTerrains', 'gameTerrainSelection', function onTerrainsCommandServiceFactory(commandsService, terrainService, gameTerrainsService, gameTerrainSelectionService) {
  var onTerrainsCommandService = {
    execute: function onTerrainsExecute(method, args, stamps, state, game) {
      if ('Function' !== R.type(terrainService[method])) {
        return self.Promise.reject('Unknown method "' + method + '" on terrain');
      }

      var ctxt = {
        before: [],
        after: [],
        desc: method
      };

      return R.pipeP(gameTerrainsService.fromStamps$('saveState', [], stamps), function (before) {
        ctxt.before = before;

        return gameTerrainsService.onStamps(method, args, stamps, game.terrains);
      }, function (terrains) {
        game = R.assoc('terrains', terrains, game);

        return gameTerrainsService.fromStamps('saveState', [], stamps, game.terrains);
      }, function (after) {
        ctxt.after = after;

        R.forEach(function (stamp) {
          state.changeEvent('Game.terrain.change.' + stamp);
        }, stamps);

        return [ctxt, game];
      })(game.terrains);
    },
    replay: function onTerrainsRedo(ctxt, state, game) {
      var stamps = R.pluck('stamp', ctxt.after);
      return R.pipeP(gameTerrainsService.setStateStamps$(ctxt.after, stamps), function (terrains) {
        game = R.assoc('terrains', terrains, game);

        return gameTerrainSelectionService.set('remote', stamps, state, game.terrain_selection);
      }, function (selection) {
        game = R.assoc('terrain_selection', selection, game);

        R.forEach(function (stamp) {
          state.changeEvent('Game.terrain.change.' + stamp);
        }, stamps);

        return game;
      })(game.terrains);
    },
    undo: function onTerrainsUndo(ctxt, state, game) {
      var stamps = R.pluck('stamp', ctxt.before);
      return R.pipeP(gameTerrainsService.setStateStamps$(ctxt.before, stamps), function (terrains) {
        game = R.assoc('terrains', terrains, game);

        return gameTerrainSelectionService.set('remote', stamps, state, game.terrain_selection);
      }, function (selection) {
        game = R.assoc('terrain_selection', selection, game);

        R.forEach(function (stamp) {
          state.changeEvent('Game.terrain.change.' + stamp);
        }, stamps);

        return game;
      })(game.terrains);
    }
  };
  commandsService.registerCommand('onTerrains', onTerrainsCommandService);
  return onTerrainsCommandService;
}]);
//# sourceMappingURL=onTerrains.js.map
