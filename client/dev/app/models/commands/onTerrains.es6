(function() {
  angular.module('clickApp.services')
    .factory('onTerrainsCommand', onTerrainsCommandModelFactory);

  onTerrainsCommandModelFactory.$inject = [
    'commands',
    'terrain',
    'gameTerrains',
    'gameTerrainSelection',
  ];
  function onTerrainsCommandModelFactory(commandsModel,
                                         terrainModel,
                                         gameTerrainsModel,
                                         gameTerrainSelectionModel) {
    const onTerrainsCommandModel = {
      executeP: onTerrainsExecuteP,
      replayP: onTerrainsReplayP,
      undoP: onTerrainsUndoP
    };

    const applyMethodOnGameTerrainsP$ = R.curry(applyMethodOnGameTerrainsP);
    const setStates$ = R.curry(setStates);
    const saveStatesP$ = R.curry(saveStatesP);
    const setRemoteSelection$ = R.curry(setRemoteSelection);
    const emitChangeEvents$ = R.curry(emitChangeEvents);

    commandsModel.registerCommand('onTerrains', onTerrainsCommandModel);
    return onTerrainsCommandModel;

    function onTerrainsExecuteP(method, args, stamps, state, game) {
      return R.threadP(terrainModel)(
        R.prop(method),
        R.type,
        R.rejectIf(R.complement(R.equals('Function')),
                   `Unknown method "${method}" on terrain`),
        () => {
          const ctxt = {
            before: [],
            after: [],
            desc: method
          };

          return R.threadP(game)(
            saveStatesP$(ctxt, 'before', stamps),
            applyMethodOnGameTerrainsP$(method, args, stamps),
            saveStatesP$(ctxt, 'after', stamps),
            emitChangeEvents$(stamps, state),
            (game) => {
              return [ctxt, game];
            }
          );
        }
      );
    }
    function onTerrainsReplayP(ctxt, state, game) {
      const stamps = R.pluck('stamp', ctxt.after);
      return R.threadP(game)(
        setStates$(ctxt.after, stamps),
        setRemoteSelection$(stamps, state),
        emitChangeEvents$(stamps, state)
      );
    }
    function onTerrainsUndoP(ctxt, state, game) {
      const stamps = R.pluck('stamp', ctxt.before);
      return R.threadP(game)(
        setStates$(ctxt.before, stamps),
        setRemoteSelection$(stamps, state),
        emitChangeEvents$(stamps, state)
      );
    }

    function applyMethodOnGameTerrainsP(method, args, stamps, game) {
      return R.threadP(game.terrains)(
        gameTerrainsModel.onStampsP$(method, args, stamps),
        (terrains) => {
          return R.assoc('terrains', terrains, game);
        }
      );
    }
    function setStates(states, stamps, game) {
      return R.threadP(game.terrains)(
        gameTerrainsModel.setStateStampsP$(states, stamps),
        (terrains) => {
          return R.assoc('terrains', terrains, game);
        }
      );
    }
    function saveStatesP(ctxt, prop, stamps, game) {
      return R.threadP(game.terrains)(
        gameTerrainsModel.fromStampsP$('saveState', [], stamps),
        (states) => {
          ctxt[prop] = states;
          return game;
        }
      );
    }
    function setRemoteSelection(stamps, state, game) {
      return R.thread(game.terrain_selection)(
        gameTerrainSelectionModel.set$('remote', stamps, state),
        (selection) => {
          return R.assoc('terrain_selection', selection, game);
        }
      );
    }
    function emitChangeEvents(stamps, state, game) {
      R.forEach((stamp) => {
        state.queueChangeEventP(`Game.terrain.change.${stamp}`);
      }, stamps);
      return game;
    }
  }
})();
