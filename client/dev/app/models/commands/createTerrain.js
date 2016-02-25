'use strict';

(function () {
  angular.module('clickApp.services').factory('createTerrainCommand', createTerrainCommandModelFactory);

  createTerrainCommandModelFactory.$inject = ['commands', 'point', 'terrain', 'gameTerrains', 'gameTerrainSelection'];
  function createTerrainCommandModelFactory(commandsModel, pointModel, terrainModel, gameTerrainsModel, gameTerrainSelectionModel) {
    var createTerrainCommandModel = {
      executeP: createTerrainExecuteP,
      replayP: createTerrainReplayP,
      undoP: createTerrainUndoP
    };

    var emitCreateEvent$ = R.curry(emitCreateEvent);
    var onCreatedTerrains$ = R.curry(onCreatedTerrains);

    commandsModel.registerCommand('createTerrain', createTerrainCommandModel);
    return createTerrainCommandModel;

    function createTerrainExecuteP(create, is_flipped, state, game) {
      var add$ = pointModel.addToWithFlip$(is_flipped);
      return R.threadP(create)(R.prop('terrains'), R.map(addTerrainP), R.promiseAll, R.reject(R.isNil), R.rejectIf(R.isEmpty, 'No valid terrain definition'), onNewTerrains);

      function addTerrainP(terrain) {
        return R.thread(terrain)(add$(create.base), R.omit(['stamp']), tryToCreateTerrainP);
      }
      function onNewTerrains(terrains) {
        var ctxt = {
          terrains: R.map(terrainModel.saveState, terrains),
          desc: terrains[0].state.info.join('.')
        };
        return R.thread(terrains)(onCreatedTerrains$('local', state, game), function (game) {
          return [ctxt, game];
        });
      }
    }
    function createTerrainReplayP(ctxt, state, game) {
      return R.threadP(ctxt)(R.prop('terrains'), R.map(tryToCreateTerrainP), R.promiseAll, R.reject(R.isNil), R.rejectIf(R.isEmpty, 'No valid terrain definition'), onCreatedTerrains$('remote', state, game));
    }
    function createTerrainUndoP(ctxt, state, game) {
      var stamps = R.pluck('stamp', ctxt.terrains);
      return R.thread(game)(R.over(R.lensProp('terrains'), gameTerrainsModel.removeStamps$(stamps)), R.over(R.lensProp('terrain_selection'), gameTerrainSelectionModel.removeFrom$('local', stamps, state)), R.over(R.lensProp('terrain_selection'), gameTerrainSelectionModel.removeFrom$('remote', stamps, state)), emitCreateEvent$(state));
    }
    function tryToCreateTerrainP(terrain) {
      return self.Promise.resolve(terrainModel.create(terrain)).catch(R.always(null));
    }
    function onCreatedTerrains(selection, state, game, terrains) {
      return R.thread(game)(addToGameTerrains, addToGameTerrainSelection, emitCreateEvent$(state));

      function addToGameTerrains(game) {
        return R.thread(game.terrains)(gameTerrainsModel.add$(terrains), function (game_terrains) {
          return R.assoc('terrains', game_terrains, game);
        });
      }
      function addToGameTerrainSelection(game) {
        var stamps = R.map(R.path(['state', 'stamp']), terrains);
        return R.thread(game.terrain_selection)(gameTerrainSelectionModel.set$(selection, stamps, state), function (selection) {
          return R.assoc('terrain_selection', selection, game);
        });
      }
    }
    function emitCreateEvent(state, game) {
      state.queueChangeEventP('Game.terrain.create');
      return game;
    }
  }
})();
//# sourceMappingURL=createTerrain.js.map
