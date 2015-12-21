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
        execute: function deleteTerrainExecute(stamps, scope, game) {
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
                  game.terrains = game_terrains;

                  return gameTerrainSelectionService
                    .removeFrom('local', stamps, scope, game.terrain_selection);
                },
                gameTerrainSelectionService.removeFrom$('remote', stamps, scope),
                (selection) => {
                  game.terrain_selection = selection;
                  
                  scope.gameEvent('createTerrain');
                  return ctxt;
                }
              )(game.terrains);
            }
          )(stamps);
        },
        replay: function deleteTerrainReplay(ctxt, scope, game) {
          return R.pipe(
            R.map(R.prop('stamp')),
            (stamps) => {
              return R.pipe(
                () => {
                  return gameTerrainsService.removeStamps(stamps, game.terrains);
                },
                (game_terrains) => {
                  game.terrains = game_terrains;

                  return gameTerrainSelectionService
                    .removeFrom('local', stamps, scope, game.terrain_selection);
                },
                gameTerrainSelectionService.removeFrom$('remote', stamps, scope),
                (selection) => {
                  game.terrain_selection = selection;
                  
                  scope.gameEvent('createTerrain');
                }
              )();
            }
          )(ctxt.terrains);
        },
        undo: function deleteTerrainUndo(ctxt, scope, game) {
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
                  game.terrains = game_terrains;

                  var stamps = R.map(R.path(['state','stamp']), terrains);
                  return gameTerrainSelectionService
                    .set('remote', stamps, scope, game.terrain_selection);
                },
                (selection) => {
                  game.terrain_selection = selection;
                  
                  scope.gameEvent('createTerrain');
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
