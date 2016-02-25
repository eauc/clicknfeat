'use strict';

(function () {
  angular.module('clickApp.services').factory('onTerrainsCommand', onTerrainsCommandModelFactory);

  onTerrainsCommandModelFactory.$inject = ['commands', 'terrain', 'gameTerrains', 'gameTerrainSelection'];
  function onTerrainsCommandModelFactory(commandsModel, terrainModel, gameTerrainsModel, gameTerrainSelectionModel) {
    var onTerrainsCommandModel = {
      executeP: onTerrainsExecuteP,
      replayP: onTerrainsReplayP,
      undoP: onTerrainsUndoP
    };

    var applyMethodOnGameTerrainsP$ = R.curry(applyMethodOnGameTerrainsP);
    var setStates$ = R.curry(setStates);
    var saveStatesP$ = R.curry(saveStatesP);
    var setRemoteSelection$ = R.curry(setRemoteSelection);
    var emitChangeEvents$ = R.curry(emitChangeEvents);

    commandsModel.registerCommand('onTerrains', onTerrainsCommandModel);
    return onTerrainsCommandModel;

    function onTerrainsExecuteP(method, args, stamps, state, game) {
      return R.threadP(terrainModel)(R.prop(method), R.type, R.rejectIf(R.complement(R.equals('Function')), 'Unknown method "' + method + '" on terrain'), function () {
        var ctxt = {
          before: [],
          after: [],
          desc: method
        };

        return R.threadP(game)(saveStatesP$(ctxt, 'before', stamps), applyMethodOnGameTerrainsP$(method, args, stamps), saveStatesP$(ctxt, 'after', stamps), emitChangeEvents$(stamps, state), function (game) {
          return [ctxt, game];
        });
      });
    }
    function onTerrainsReplayP(ctxt, state, game) {
      var stamps = R.pluck('stamp', ctxt.after);
      return R.threadP(game)(setStates$(ctxt.after, stamps), setRemoteSelection$(stamps, state), emitChangeEvents$(stamps, state));
    }
    function onTerrainsUndoP(ctxt, state, game) {
      var stamps = R.pluck('stamp', ctxt.before);
      return R.threadP(game)(setStates$(ctxt.before, stamps), setRemoteSelection$(stamps, state), emitChangeEvents$(stamps, state));
    }

    function applyMethodOnGameTerrainsP(method, args, stamps, game) {
      return R.threadP(game.terrains)(gameTerrainsModel.onStampsP$(method, args, stamps), function (terrains) {
        return R.assoc('terrains', terrains, game);
      });
    }
    function setStates(states, stamps, game) {
      return R.threadP(game.terrains)(gameTerrainsModel.setStateStampsP$(states, stamps), function (terrains) {
        return R.assoc('terrains', terrains, game);
      });
    }
    function saveStatesP(ctxt, prop, stamps, game) {
      return R.threadP(game.terrains)(gameTerrainsModel.fromStampsP$('saveState', [], stamps), function (states) {
        ctxt[prop] = states;
        return game;
      });
    }
    function setRemoteSelection(stamps, state, game) {
      return R.thread(game.terrain_selection)(gameTerrainSelectionModel.set$('remote', stamps, state), function (selection) {
        return R.assoc('terrain_selection', selection, game);
      });
    }
    function emitChangeEvents(stamps, state, game) {
      R.forEach(function (stamp) {
        state.queueChangeEventP('Game.terrain.change.' + stamp);
      }, stamps);
      return game;
    }
  }
})();
//# sourceMappingURL=onTerrains.js.map
