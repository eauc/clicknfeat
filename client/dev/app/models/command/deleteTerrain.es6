angular.module('clickApp.services')
  .factory('deleteTerrainCommand', [
    'commands',
    'terrain',
    'gameTerrains',
    'gameTerrainSelection',
    function deleteTerrainCommandServiceFactory(commandsService,
                                                terrainService,
                                                gameTerrainsService,
                                                gameTerrainSelectionService) {
      var deleteTerrainCommandService = {
        execute: function deleteTerrainExecute(stamps, state, game) {
          return R.pipeP(
            (stamps) => {
              return gameTerrainsService.findAnyStamps(stamps, game.terrains);
            },
            R.reject(R.isNil),
            R.map(terrainService.saveState),
            (states) => {
              var ctxt = {
                terrains: states,
                desc: ''
              };
              return R.pipe(
                gameTerrainsService.removeStamps$(stamps),
                (game_terrains) => {
                  game = R.assoc('terrains', game_terrains, game);

                  return gameTerrainSelectionService
                    .removeFrom('local', stamps, state, game.terrain_selection);
                },
                gameTerrainSelectionService.removeFrom$('remote', stamps, state),
                (selection) => {
                  game = R.assoc('terrain_selection', selection, game);
                  
                  state.changeEvent('Game.terrain.create');
                  
                  return [ctxt, game];
                }
              )(game.terrains);
            }
          )(stamps);
        },
        replay: function deleteTerrainReplay(ctxt, state, game) {
          return R.pipe(
            R.pluck('stamp'),
            (stamps) => {
              return R.pipe(
                () => {
                  return gameTerrainsService.removeStamps(stamps, game.terrains);
                },
                (game_terrains) => {
                  game = R.assoc('terrains', game_terrains, game);

                  return gameTerrainSelectionService
                    .removeFrom('local', stamps, state, game.terrain_selection);
                },
                gameTerrainSelectionService.removeFrom$('remote', stamps, state),
                (selection) => {
                  game = R.assoc('terrain_selection', selection, game);
                  
                  state.changeEvent('Game.terrain.create');

                  return game;
                }
              )();
            }
          )(ctxt.terrains);
        },
        undo: function deleteTerrainUndo(ctxt, state, game) {
          return R.pipePromise(
            R.map((terrain) => {
              return self.Promise
                .resolve(terrainService.create(terrain))
                .catch(R.always(null));
            }),
            R.promiseAll,
            R.reject(R.isNil),
            (terrains) => {
              if(R.isEmpty(terrains)) {
                return self.Promise.reject('No valid terrain definition');
              }
              
              return R.pipe(
                gameTerrainsService.add$(terrains),
                (game_terrains) => {
                  game = R.assoc('terrains', game_terrains, game);

                  var stamps = R.map(R.path(['state','stamp']), terrains);
                  return gameTerrainSelectionService
                    .set('remote', stamps, state, game.terrain_selection);
                },
                (selection) => {
                  game = R.assoc('terrain_selection', selection, game);
                  
                  state.changeEvent('Game.terrain.create');

                  return game;
                }
              )(game.terrains);
            }
          )(ctxt.terrains);
        }
      };
      commandsService.registerCommand('deleteTerrain', deleteTerrainCommandService);
      return deleteTerrainCommandService;
    }
  ]);
