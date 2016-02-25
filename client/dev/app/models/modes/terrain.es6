(function() {
  angular.module('clickApp.services')
    .factory('terrainMode', terrainModeModelFactory);

  terrainModeModelFactory.$inject = [
    'modes',
    'settings',
    'defaultMode',
    'terrain',
    'game',
    'gameTerrains',
    'gameTerrainSelection',
  ];
  function terrainModeModelFactory(modesModel,
                                   settingsModel,
                                   defaultModeModel,
                                   terrainModel,
                                   gameModel,
                                   gameTerrainsModel,
                                   gameTerrainSelectionModel) {
    const terrain_actions = Object.create(defaultModeModel.actions);
    terrain_actions.modeBackToDefault = clearTerrainSelection;
    terrain_actions.clickMap = clearTerrainSelection;
    terrain_actions.rightClickMap = clearTerrainSelection;
    terrain_actions.copySelection = copySelection;
    terrain_actions.delete = doDelete;
    terrain_actions.toggleLock = toggleLock;

    const moves = [
      ['moveFront', 'up'],
      ['moveBack', 'down'],
      ['rotateLeft', 'left'],
      ['rotateRight', 'right'],
    ];
    R.forEach(buildMove, moves);
    const shifts = [
      ['shiftUp', 'ctrl+up', 'shiftDown'],
      ['shiftDown', 'ctrl+down', 'shiftUp'],
      ['shiftLeft', 'ctrl+left', 'shiftRight'],
      ['shiftRight', 'ctrl+right', 'shiftLeft'],
    ];
    R.forEach(buildShift, shifts);
    buildDrag();

    const terrain_default_bindings = {
      'clickMap': 'clickMap',
      'rightClickMap': 'rightClickMap',
      'copySelection': 'ctrl+c',
      'delete': 'del',
      'toggleLock': 'l'
    };
    R.forEach(buildMoveBindings, moves);
    R.forEach(buildShiftBindings, shifts);
    const terrain_bindings = R.extend(Object.create(defaultModeModel.bindings),
                                    terrain_default_bindings);
    const terrain_buttons = [
      [ 'Delete', 'delete' ],
      [ 'Lock/Unlock', 'toggleLock' ],
    ];
    const terrain_mode = {
      onEnter: () => { },
      onLeave: () => { },
      name: 'Terrain',
      actions: terrain_actions,
      buttons: terrain_buttons,
      bindings: terrain_bindings
    };

    modesModel.registerMode(terrain_mode);
    settingsModel.register('Bindings',
                           terrain_mode.name,
                           terrain_default_bindings,
                           (bs) => {
                             R.extend(terrain_mode.bindings, bs);
                           });
    return terrain_mode;

    function clearTerrainSelection(state) {
      return state.eventP('Game.update', R.lensProp('terrain_selection'),
                         gameTerrainSelectionModel.clear$('local', state));
    }
    function copySelection(state) {
      const stamps = gameTerrainSelectionModel
            .get('local', state.game.terrain_selection);
      return R.threadP(state.game.terrains)(
        gameTerrainsModel.copyStampsP$(stamps),
        (copy) => {
          state.create = copy;
          return state.eventP('Modes.switchTo', 'CreateTerrain');
        }
      );
    }
    function doDelete(state) {
      const stamps = gameTerrainSelectionModel
            .get('local', state.game.terrain_selection);
      return state.eventP('Game.command.execute',
                          'deleteTerrain', [stamps]);
    }
    function toggleLock(state) {
      const stamps = gameTerrainSelectionModel
            .get('local', state.game.terrain_selection);
      return R.threadP(state.game.terrains)(
        gameTerrainsModel.findStampP$(stamps[0]),
        (terrain) => {
          const is_locked = terrainModel.isLocked(terrain);
          return state.eventP('Game.command.execute',
                              'lockTerrains', [!is_locked, stamps]);
        }
      );
    }
    function buildMove([move]) {
      terrain_actions[move] = (state) => {
        const stamps = gameTerrainSelectionModel
              .get('local', state.game.terrain_selection);
        return state.eventP('Game.command.execute',
                            'onTerrains', [ `${move}P`, [false], stamps ]);
      };
      terrain_actions[move+'Small'] = (state) => {
        const stamps = gameTerrainSelectionModel
              .get('local', state.game.terrain_selection);
        return state.eventP('Game.command.execute',
                            'onTerrains', [ `${move}P`, [true], stamps ]);
      };
    }
    function buildShift([shift, key, flip_shift]) {
      terrain_actions[shift] = (state) => {
        const stamps = gameTerrainSelectionModel
              .get('local', state.game.terrain_selection);
        const terrain_shift = ( R.path(['ui_state', 'flip_map'], state)
                                ? flip_shift
                                : shift
                              );
        return state.eventP('Game.command.execute',
                            'onTerrains', [ `${terrain_shift}P`, [false], stamps ]);
      };
      terrain_actions[shift+'Small'] = (state) => {
        const stamps = gameTerrainSelectionModel
              .get('local', state.game.terrain_selection);
        const terrain_shift = ( R.path(['ui_state', 'flip_map'], state)
                                ? flip_shift
                                : shift
                              );
        return state.eventP('Game.command.execute',
                            'onTerrains', [ `${terrain_shift}P`, [true], stamps ]);
      };
    }

    function buildDrag() {
      let drag_terrain_start_state;
      terrain_actions.dragStartTerrain = (state, event) => {
        return R.threadP(event.target)(
          R.rejectIf(terrainModel.isLocked, 'Terrain is locked'),
          () => {
            drag_terrain_start_state = R.clone(event.target.state);
            return terrain_actions.dragTerrain(state, event);
          },
          () => {
            return state
              .eventP('Game.update',
                      R.lensProp('terrain_selection'),
                      gameTerrainSelectionModel.set$('local', [event.target.state.stamp], state));
          }
        );
      };
      defaultModeModel.actions.dragStartTerrain = terrain_actions.dragStartTerrain;
      terrain_actions.dragTerrain = (state, event) => {
        return R.threadP(event.target)(
          R.rejectIf(terrainModel.isLocked, 'Terrain is locked'),
          () => {
            updateStateWithDelta(event, event.target.state);
            state.queueChangeEventP(`Game.terrain.change.${event.target.state.stamp}`);
          }
        );
      };
      terrain_actions.dragEndTerrain = (state, event) => {
        return R.threadP(event.target)(
          R.rejectIf(terrainModel.isLocked, 'Terrain is locked'),
          () => {
            event.target.state = R.clone(drag_terrain_start_state);
            const end_state = R.clone(drag_terrain_start_state);
            updateStateWithDelta(event, end_state);
            return state.eventP('Game.command.execute',
                                'onTerrains', [ 'setPositionP',
                                                [end_state],
                                                [event.target.state.stamp]
                                              ]);
          }
        );
      };
      function updateStateWithDelta(event, state) {
        const dx = event.now.x - event.start.x;
        const dy = event.now.y - event.start.y;
        state.x = drag_terrain_start_state.x + dx;
        state.y = drag_terrain_start_state.y + dy;
      }
    }

    function buildMoveBindings([move, keys]) {
      terrain_default_bindings[move] = keys;
      terrain_default_bindings[move+'Small'] = 'shift+'+keys;
    }
    function buildShiftBindings([shift, keys]) {
      terrain_default_bindings[shift] = keys;
      terrain_default_bindings[shift+'Small'] = 'shift+'+keys;
    }
  }
})();
