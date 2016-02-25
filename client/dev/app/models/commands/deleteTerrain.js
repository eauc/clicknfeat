'use strict';

(function () {
  angular.module('clickApp.models').factory('deleteTerrainCommand', deleteTerrainCommandModelFactory);

  deleteTerrainCommandModelFactory.$inject = ['commands', 'terrain', 'gameTerrains', 'gameTerrainSelection'];
  function deleteTerrainCommandModelFactory(commandsModel, terrainModel, gameTerrainsModel, gameTerrainSelectionModel) {
    var deleteTerrainCommandModel = {
      executeP: deleteTerrainExecuteP,
      replayP: deleteTerrainReplayP,
      undoP: deleteTerrainUndoP
    };

    var onDeletedStates$ = R.curry(onDeletedStates);
    var emitCreateEvent$ = R.curry(emitCreateEvent);

    commandsModel.registerCommand('deleteTerrain', deleteTerrainCommandModel);
    return deleteTerrainCommandModel;

    function deleteTerrainExecuteP(stamps, state, game) {
      return R.threadP(game.terrains)(gameTerrainsModel.findAnyStampsP$(stamps), R.reject(R.isNil), R.map(terrainModel.saveState), onNewDeletedStates);

      function onNewDeletedStates(states) {
        var ctxt = {
          terrains: states,
          desc: ''
        };
        return R.thread(states)(onDeletedStates$(state, game), function (game) {
          return [ctxt, game];
        });
      }
    }
    function deleteTerrainReplayP(ctxt, state, game) {
      return onDeletedStates(state, game, ctxt.terrains);
    }
    function deleteTerrainUndoP(ctxt, state, game) {
      return R.threadP(ctxt.terrains)(R.map(tryToCreateTerrain), R.promiseAll, R.reject(R.isNil), R.rejectIf(R.isEmpty, 'No valid terrain definition'), onNewCreatedTerrains);

      function tryToCreateTerrain(terrain) {
        return self.Promise.resolve(terrainModel.create(terrain)).catch(R.always(null));
      }
      function onNewCreatedTerrains(terrains) {
        var stamps = R.map(R.path(['state', 'stamp']), terrains);
        return R.thread(game)(addToGameTerrains, addToGameTerrainSelection, emitCreateEvent$(state));

        function addToGameTerrains(game) {
          return R.thread(game.terrains)(gameTerrainsModel.add$(terrains), function (game_terrains) {
            return R.assoc('terrains', game_terrains, game);
          });
        }
        function addToGameTerrainSelection(game) {
          return R.thread(game.terrain_selection)(gameTerrainSelectionModel.set$('remote', stamps, state), function (selection) {
            return R.assoc('terrain_selection', selection, game);
          });
        }
      }
    }
    function onDeletedStates(state, game, states) {
      var stamps = R.pluck('stamp', states);
      return R.thread(game)(removeFromGameTerrains, removeFromGameTerrainSelection, emitCreateEvent$(state));
      function removeFromGameTerrains(game) {
        return R.thread(game.terrains)(gameTerrainsModel.removeStamps$(stamps), function (game_terrains) {
          return R.assoc('terrains', game_terrains, game);
        });
      }
      function removeFromGameTerrainSelection(game) {
        return R.thread(game.terrain_selection)(gameTerrainSelectionModel.removeFrom$('local', stamps, state), gameTerrainSelectionModel.removeFrom$('remote', stamps, state), function (selection) {
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
//# sourceMappingURL=deleteTerrain.js.map
