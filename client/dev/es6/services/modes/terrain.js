angular.module('clickApp.services')
  .factory('terrainMode', [
    'modes',
    'settings',
    'defaultMode',
    'terrain',
    'game',
    'gameTerrains',
    'gameTerrainSelection',
    function terrainModeServiceFactory(modesService,
                                       settingsService,
                                       defaultModeService,
                                       terrainService,
                                       gameService,
                                       gameTerrainsService,
                                       gameTerrainSelectionService) {
      let terrain_actions = Object.create(defaultModeService.actions);
      function clearTerrainSelection(state) {
        return state.event('Game.update', R.lensProp('terrain_selection'),
                           gameTerrainSelectionService.clear$('local', state));
      }
      terrain_actions.modeBackToDefault = clearTerrainSelection;
      terrain_actions.clickMap = clearTerrainSelection;
      terrain_actions.rightClickMap = clearTerrainSelection;
      terrain_actions.copySelection = (state) => {
        let stamps = gameTerrainSelectionService
              .get('local', state.game.terrain_selection);
        return R.pipeP(
          gameTerrainsService.copyStamps$(stamps),
          (copy) => {
            state.create.terrain = copy;
            return state.event('Modes.switchTo','CreateTerrain');
          }
        )(state.game.terrains);
      };
      terrain_actions.delete = (state) => {
        let stamps = gameTerrainSelectionService
              .get('local', state.game.terrain_selection);
        return state.event('Game.command.execute',
                           'deleteTerrain', [stamps]);
      };
      terrain_actions.toggleLock = (state) => {
        let stamps = gameTerrainSelectionService
              .get('local', state.game.terrain_selection);
        return R.pipeP(
          () => {
            return gameTerrainsService
              .findStamp(stamps[0], state.game.terrains);
          },
          (terrain) => {
            let is_locked = terrainService.isLocked(terrain);
        
            return state.event('Game.command.execute',
                               'lockTerrains', [!is_locked, stamps]);
          }
        )();
      };
      let moves = [
        ['moveFront', 'up'],
        ['moveBack', 'down'],
        ['rotateLeft', 'left'],
        ['rotateRight', 'right'],
      ];
      R.forEach(([move]) => {
        terrain_actions[move] = (state) => {
          let stamps = gameTerrainSelectionService
                .get('local', state.game.terrain_selection);
          return state.event('Game.command.execute',
                             'onTerrains', [ move, [false], stamps ]);
        };
        terrain_actions[move+'Small'] = (state) => {
          let stamps = gameTerrainSelectionService
                .get('local', state.game.terrain_selection);
          return state.event('Game.command.execute',
                             'onTerrains', [ move, [true], stamps ]);
        };
      }, moves);
      let shifts = [
        ['shiftUp', 'ctrl+up', 'shiftDown'],
        ['shiftDown', 'ctrl+down', 'shiftUp'],
        ['shiftLeft', 'ctrl+left', 'shiftRight'],
        ['shiftRight', 'ctrl+right', 'shiftLeft'],
      ];
      R.forEach(([shift, key, flip_shift]) => {
        key = key;
        terrain_actions[shift] = (state) => {
          let stamps = gameTerrainSelectionService
                .get('local', state.game.terrain_selection);
          let terrain_shift = ( R.path(['ui_state', 'flip_map'], state) ?
                                flip_shift :
                                shift
                              );
          return state.event('Game.command.execute',
                             'onTerrains', [ terrain_shift, [false], stamps ]);
        };
        terrain_actions[shift+'Small'] = (state) => {
          let stamps = gameTerrainSelectionService
                .get('local', state.game.terrain_selection);
          let terrain_shift = ( R.path(['ui_state', 'flip_map'], state) ?
                                flip_shift :
                                shift
                              );
          return state.event('Game.command.execute',
                             'onTerrains', [ terrain_shift, [true], stamps ]);
        };
      }, shifts);

      (() => {
        let drag_terrain_start_state;
        function updateStateWithDelta(event, state) {
          let dx = event.now.x - event.start.x;
          let dy = event.now.y - event.start.y;
          state.x = drag_terrain_start_state.x + dx;
          state.y = drag_terrain_start_state.y + dy;
        }
        terrain_actions.dragStartTerrain = (state, event) => {
          if(terrainService.isLocked(event.target)) {
            return self.Promise.reject('Terrain is locked');
          }

          drag_terrain_start_state = R.clone(event.target.state);
          terrain_actions.dragTerrain(state, event);
          return state
            .event('Game.update', R.lensProp('terrain_selection'),
                   gameTerrainSelectionService.set$('local', [event.target.state.stamp], state));
        };
        defaultModeService.actions.dragStartTerrain = terrain_actions.dragStartTerrain;
        terrain_actions.dragTerrain = (state, event) => {
          if(terrainService.isLocked(event.target)) {
            return self.Promise.reject('Terrain is locked');
          }

          updateStateWithDelta(event, event.target.state);
          state.changeEvent(`Game.terrain.change.${event.target.state.stamp}`);
          return null;
        };
        terrain_actions.dragEndTerrain = (state, event) => {
          if(terrainService.isLocked(event.target)) {
            return self.Promise.reject('Terrain is locked');
          }

          event.target.state = R.clone(drag_terrain_start_state);
          let end_state = R.clone(drag_terrain_start_state);
          updateStateWithDelta(event, end_state);
          return state.event('Game.command.execute',
                             'onTerrains', [ 'setPosition',
                                             [end_state],
                                             [event.target.state.stamp]
                                           ]);
        };
      })();

      let terrain_default_bindings = {
        'clickMap': 'clickMap',
        'rightClickMap': 'rightClickMap',
        'copySelection': 'ctrl+c',
        'delete': 'del',
        'toggleLock': 'l'
      };
      R.forEach(([move, keys]) => {
        terrain_default_bindings[move] = keys;
        terrain_default_bindings[move+'Small'] = 'shift+'+keys;
      }, moves);
      R.forEach(([shift, keys]) => {
        terrain_default_bindings[shift] = keys;
        terrain_default_bindings[shift+'Small'] = 'shift+'+keys;
      }, shifts);
      let terrain_bindings = R.extend(Object.create(defaultModeService.bindings),
                                       terrain_default_bindings);
      let terrain_buttons = [
        [ 'Delete', 'delete' ],
        [ 'Lock/Unlock', 'toggleLock' ],
      ];
      let terrain_mode = {
        onEnter: () => { },
        onLeave: () => { },
        name: 'Terrain',
        actions: terrain_actions,
        buttons: terrain_buttons,
        bindings: terrain_bindings
      };
      modesService.registerMode(terrain_mode);
      settingsService.register('Bindings',
                               terrain_mode.name,
                               terrain_default_bindings,
                               (bs) => {
                                 R.extend(terrain_mode.bindings, bs);
                               });
      return terrain_mode;
    }
  ]);
