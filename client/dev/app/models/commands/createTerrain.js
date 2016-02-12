'use strict';

angular.module('clickApp.services').factory('createTerrainCommand', ['commands', 'point', 'terrain', 'gameTerrains', 'gameTerrainSelection', function createTerrainCommandServiceFactory(commandsService, pointService, terrainService, gameTerrainsService, gameTerrainSelectionService) {
  var createTerrainCommandService = {
    execute: function createTerrainExecute(create, is_flipped, state, game) {
      var add$ = pointService.addToWithFlip$(is_flipped);
      return R.pipePromise(R.prop('terrains'), R.map(function (terrain) {
        return R.pipe(add$(create.base), R.omit(['stamp']), R.spyError('terrain', create, is_flipped), function (terrain) {
          return self.Promise.resolve(terrainService.create(terrain)).catch(R.always(null));
        })(terrain);
      }), R.promiseAll, R.reject(R.isNil), R.rejectIf(R.isEmpty, 'No valid terrain definition'), R.spyError('terrains'), function (terrains) {
        var ctxt = {
          terrains: R.map(terrainService.saveState, terrains),
          desc: terrains[0].state.info.join('.')
        };
        return R.pipe(gameTerrainsService.add$(terrains), function (game_terrains) {
          game = R.assoc('terrains', game_terrains, game);

          return gameTerrainSelectionService.set('local', R.map(R.path(['state', 'stamp']), terrains), state, game.terrain_selection);
        }, function (selection) {
          game = R.assoc('terrain_selection', selection, game);

          state.changeEvent('Game.terrain.create');

          return [ctxt, game];
        })(game.terrains);
      })(create);
    },
    replay: function createTerrainReplay(ctxt, state, game) {
      return R.pipePromise(R.prop('terrains'), R.map(function (terrain) {
        return self.Promise.resolve(terrainService.create(terrain)).catch(R.always(null));
      }), R.promiseAll, R.reject(R.isNil), R.rejectIf(R.isEmpty, 'No valid terrain definition'), function (terrains) {
        return R.pipe(gameTerrainsService.add$(terrains), function (game_terrains) {
          game = R.assoc('terrains', game_terrains, game);

          return gameTerrainSelectionService.set('remote', R.map(R.path(['state', 'stamp']), terrains), state, game.terrain_selection);
        }, function (selection) {
          game = R.assoc('terrain_selection', selection, game);

          state.changeEvent('Game.terrain.create');

          return game;
        })(game.terrains);
      })(ctxt);
    },
    undo: function createTerrainUndo(ctxt, state, game) {
      var stamps = R.pluck('stamp', ctxt.terrains);
      game = R.pipe(R.over(R.lensProp('terrains'), gameTerrainsService.removeStamps$(stamps)), R.over(R.lensProp('terrain_selection'), gameTerrainSelectionService.removeFrom$('local', stamps, state)), R.over(R.lensProp('terrain_selection'), gameTerrainSelectionService.removeFrom$('remote', stamps, state)))(game);
      state.changeEvent('Game.terrain.create');
      return game;
    }
  };
  commandsService.registerCommand('createTerrain', createTerrainCommandService);
  return createTerrainCommandService;
}]);
//# sourceMappingURL=createTerrain.js.map
