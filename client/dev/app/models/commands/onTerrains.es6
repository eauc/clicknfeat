angular.module('clickApp.services')
  .factory('onTerrainsCommand', [
    'commands',
    'terrain',
    'gameTerrains',
    'gameTerrainSelection',
    function onTerrainsCommandServiceFactory(commandsService,
                                             terrainService,
                                             gameTerrainsService,
                                             gameTerrainSelectionService) {
      var onTerrainsCommandService = {
        execute: function onTerrainsExecute(method, args, stamps, state, game) {
          if('Function' !== R.type(terrainService[method])) {
            return self.Promise.reject(`Unknown method "${method}" on terrain`);
          }
          
          var ctxt = {
            before: [],
            after: [],
            desc: method
          };

          return R.pipeP(
            gameTerrainsService.fromStamps$('saveState', [], stamps),
            (before) => {
              ctxt.before = before;
              
              return gameTerrainsService
                .onStamps(method, args, stamps, game.terrains);
            },
            (terrains) => {
              game = R.assoc('terrains', terrains, game);

              return gameTerrainsService
                .fromStamps('saveState', [], stamps, game.terrains);
            },
            (after) => {
              ctxt.after = after;

              R.forEach((stamp) => {
                state.changeEvent(`Game.terrain.change.${stamp}`);
              }, stamps);
              
              return [ctxt, game];
            }
          )(game.terrains);
        },
        replay: function onTerrainsRedo(ctxt, state, game) {
          var stamps = R.pluck('stamp', ctxt.after);
          return R.pipeP(
            gameTerrainsService.setStateStamps$(ctxt.after, stamps),
            (terrains) => {
              game = R.assoc('terrains', terrains, game);
              
              return gameTerrainSelectionService
                .set('remote', stamps, state, game.terrain_selection);
            },
            (selection) => {
              game = R.assoc('terrain_selection', selection, game);

              R.forEach((stamp) => {
                state.changeEvent(`Game.terrain.change.${stamp}`);
              }, stamps);
              
              return game;
            }
          )(game.terrains);
        },
        undo: function onTerrainsUndo(ctxt, state, game) {
          var stamps = R.pluck('stamp', ctxt.before);
          return R.pipeP(
            gameTerrainsService.setStateStamps$(ctxt.before, stamps),
            (terrains) => {
              game = R.assoc('terrains', terrains, game);
              
              return gameTerrainSelectionService
                .set('remote', stamps, state, game.terrain_selection);
            },
            (selection) => {
              game = R.assoc('terrain_selection', selection, game);

              R.forEach((stamp) => {
                state.changeEvent(`Game.terrain.change.${stamp}`);
              }, stamps);
              
              return game;
            }
          )(game.terrains);
        }
      };
      commandsService.registerCommand('onTerrains', onTerrainsCommandService);
      return onTerrainsCommandService;
    }
  ]);
