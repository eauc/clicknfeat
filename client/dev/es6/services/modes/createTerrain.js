angular.module('clickApp.services')
  .factory('createTerrainMode', [
    'modes',
    'settings',
    'commonMode',
    'game',
    function createTerrainModeServiceFactory(modesService,
                                             settingsService,
                                             commonModeService) {
      var createTerrain_actions = Object.create(commonModeService.actions);
      function updateCreateBase(coord, state) {
        state.create = R.over(
          R.lensPath(['terrain','base']),
          R.pipe(
            R.assoc('x', coord.x),
            R.assoc('y', coord.y)
          ),
          state.create
        );
      }
      createTerrain_actions.moveMap = (state, coord) => {
        updateCreateBase(coord, state);
        return state.changeEvent('Game.create.update');
      };
      createTerrain_actions.create = (state, event) => {
        let is_flipped = R.path(['ui_state','flip_map'], state);
        updateCreateBase(event['click#'], state);
        return state.event('Game.command.execute',
                           'createTerrain', [ state.create.terrain, is_flipped ]);
      };
      var createTerrain_default_bindings = {
        'create': 'clickMap'
      };
      var createTerrain_bindings = R.extend(Object.create(commonModeService.bindings),
                                            createTerrain_default_bindings);
      var createTerrain_buttons = [];
      var createTerrain_mode = {
        onEnter: (state) => {
          state.changeEvent('Game.terrain.create.enable');
          state.changeEvent('Game.moveMap.enable');
        },
        onLeave: (state) => {
          state.create = R.assoc('terrain', null, state.create);
          state.changeEvent('Game.moveMap.disable');
          state.changeEvent('Game.terrain.create.disable');
        },
        name: 'CreateTerrain',
        actions: createTerrain_actions,
        buttons: createTerrain_buttons,
        bindings: createTerrain_bindings
      };
      modesService.registerMode(createTerrain_mode);
      settingsService.register('Bindings',
                               createTerrain_mode.name,
                               createTerrain_default_bindings,
                               (bs) => {
                                 R.extend(createTerrain_mode.bindings, bs);
                               });
      return createTerrain_mode;
    }
  ]);
