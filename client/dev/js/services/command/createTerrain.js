'use strict';

angular.module('clickApp.services').factory('createTerrainCommand', ['commands', 'point', 'terrain', 'gameTerrains', 'gameTerrainSelection', function createTerrainCommandServiceFactory(commandsService, pointService, terrainService, gameTerrainsService, gameTerrainSelectionService) {
  var createTerrainCommandService = {
    execute: function createTerrainExecute(create, is_flipped, scope, game) {
      var add$ = pointService.addToWithFlip$(is_flipped);
      return R.pipePromise(R.prop('terrains'), R.map(function (terrain) {
        return R.pipe(add$(create.base), R.omit(['stamp']), function (terrain) {
          return self.Promise.resolve(terrainService.create(terrain)).catch(R.always(null));
        })(terrain);
      }), R.promiseAll, R.reject(R.isNil), function (terrains) {
        if (R.isEmpty(terrains)) {
          return self.Promise.reject('No valid terrain definition');
        }

        var ctxt = {
          terrains: R.map(terrainService.saveState, terrains),
          desc: terrains[0].state.info.join('.')
        };
        return R.pipe(gameTerrainsService.add$(terrains), function (game_terrains) {
          game.terrains = game_terrains;

          return gameTerrainSelectionService.set('local', R.map(R.path(['state', 'stamp']), terrains), scope, game.terrain_selection);
        }, function (selection) {
          game.terrain_selection = selection;

          scope.gameEvent('createTerrain');
          return ctxt;
        })(game.terrains);
      })(create);
    },
    replay: function createTerrainReplay(ctxt, scope, game) {
      return R.pipePromise(R.prop('terrains'), R.map(function (terrain) {
        return self.Promise.resolve(terrainService.create(terrain)).catch(R.always(null));
      }), R.promiseAll, R.reject(R.isNil), function (terrains) {
        if (R.isEmpty(terrains)) {
          return self.Promise.reject('No valid terrain definition');
        }

        return R.pipe(gameTerrainsService.add$(terrains), function (game_terrains) {
          game.terrains = game_terrains;

          return gameTerrainSelectionService.set('remote', R.map(R.path(['state', 'stamp']), terrains), scope, game.terrain_selection);
        }, function (selection) {
          game.terrain_selection = selection;

          scope.gameEvent('createTerrain');
        })(game.terrains);
      })(ctxt);
    },
    undo: function createTerrainUndo(ctxt, scope, game) {
      var stamps = R.map(R.prop('stamp'), ctxt.terrains);
      game.terrains = gameTerrainsService.removeStamps(stamps, game.terrains);
      game.terrain_selection = gameTerrainSelectionService.removeFrom('local', stamps, scope, game.terrain_selection);
      game.terrain_selection = gameTerrainSelectionService.removeFrom('remote', stamps, scope, game.terrain_selection);
      scope.gameEvent('createTerrain');
    }
  };
  commandsService.registerCommand('createTerrain', createTerrainCommandService);
  return createTerrainCommandService;
}]);
//# sourceMappingURL=createTerrain.js.map
