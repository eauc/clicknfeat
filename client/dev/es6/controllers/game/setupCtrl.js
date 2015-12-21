angular.module('clickApp.controllers')
  .controller('gameSetupCtrl', [
    '$scope',
    'fileImport',
    'game',
    'gameBoard',
    'gameScenario',
    'gameModels',
    'gameTerrains',
    function($scope,
             fileImportService,
             gameService,
             gameBoardService,
             gameScenarioService,
             gameModelsService,
             gameTerrainsService) {
      console.log('init gameSetupCtrl');

      $scope.onGameLoad.then(() => {
        $scope.gameEvent('refreshModelScenarioAura');
      });
      $scope.$on('$destroy', () => {
        $scope.gameEvent('refreshModelScenarioAura');
      });
      
      $scope.$watch('game.board.name', (value) => {
        $scope.board_name = value;
      });
      $scope.doSetBoard = () => {
        var board = gameBoardService.forName($scope.board_name, $scope.boards);
        $scope.doExecuteCommand('setBoard', board);
      };
      $scope.doSetRandomBoard = () => {
        var board, name = gameBoardService.name($scope.game.board);
        while(name === gameBoardService.name($scope.game.board)) {
          board = $scope.boards[R.randomRange(0, $scope.boards.length-1)];
          name = gameBoardService.name(board);
        }
        $scope.board_name = name;
        $scope.doSetBoard();
      };

      $scope.$watch('game.scenario.name', (value) => {
        $scope.scenario_name = value;
        $scope.scenario_group = gameScenarioService.groupForName($scope.scenario_name,
                                                                 $scope.scenarios);
      });
      $scope.doSetScenario = () => {
        var scenario = gameScenarioService.forName($scope.scenario_name,
                                                   $scope.scenario_group);
        $scope.doExecuteCommand('setScenario', scenario);
      };
      $scope.doSetRandomScenario = () => {
        var group = gameScenarioService.group('SR15', $scope.scenarios);
        var scenario, name = $scope.scenario_name;
        while(name === $scope.scenario_name) {
          scenario = group[1][R.randomRange(0, group[1].length-1)];
          name = gameScenarioService.name(scenario);
        }
        $scope.scenario_group = group;
        $scope.scenario_name = name;
        $scope.doSetScenario();
      };
      $scope.doGenerateObjectives = () => {
        R.pipePromise(
          () => {
            return gameModelsService.all($scope.game.models);
          },
          R.filter(R.pipe(
            R.path(['state','info']),
            R.head,
            R.equals('scenario')
          )),
          R.map(R.path(['state','stamp'])),
          (stamps) => {
            return gameService
              .executeCommand('deleteModel', stamps, $scope, $scope.game)
              .catch(R.always(null));
          },
          () => {
            return gameScenarioService
              .createObjectives($scope.game.scenario);
          },
          (objectives) => {
            var is_flipped = R.path(['ui_state','flip_map'], $scope);
            return gameService.executeCommand('createModel', objectives, is_flipped,
                                              $scope, $scope.game);
          }
        )();
      };

      $scope.doToggleLayer = (l) => {
        $scope.doExecuteCommand('setLayers', 'toggle', l);
      };

      $scope.onAmbianceChange = () => {
        $scope.category = R.head(R.keys($scope.terrains[$scope.ambiance]));
        $scope.onCategoryChange();
      };
      $scope.onCategoryChange = () => {
        $scope.entry = R.head(R.keys($scope.terrains[$scope.ambiance][$scope.category]));
        $scope.onEntryChange();
      };
      $scope.onEntryChange = () => {
      };
      $scope.data_ready.then(() => {
        $scope.ambiance = R.head(R.keys($scope.terrains));
        $scope.onAmbianceChange();
      });
      function getTerrainPath() {
        return [ $scope.ambiance,
                 $scope.category,
                 $scope.entry
               ];
      }
      $scope.getTerrain = () => {
        return R.path([
                 $scope.ambiance,
                 $scope.category,
                 $scope.entry
               ], $scope.terrains);
      };
      $scope.doCreateTerrain = () => {
        var terrain_path = getTerrainPath();
        $scope.create.terrain = {
          base: { x: 240, y: 240, r: 0 },
          terrains: [ {
            info: terrain_path,
            x: 0, y: 0, r: 0
          } ]
        };
        console.log('createTerrain', $scope.create.terrain);
        $scope.doSwitchToMode('CreateTerrain');
      };
      $scope.doResetTerrain = () => {
        return R.pipePromise(
          () => {
            return gameTerrainsService.all($scope.game.terrains);
          },
          R.pluck('state'),
          R.pluck('stamp'),
          (stamps) => {
            return gameService
              .executeCommand('deleteTerrain', stamps,
                              $scope, $scope.game);
          }
        )().catch((reason) => {
          $scope.gameEvent('modeActionError', reason);
          return self.Promise.reject(reason);
        });
      };
      
      $scope.doImportBoardFile = (files) => {
        console.log('doImportBoardFile', files);
        R.pipeP(
          fileImportService.read$('json'),
          (board_info) => {
            console.log(board_info);
            return R.pipePromise(
              () => {
                if(!board_info.board) return null;
                return gameService.executeCommand('setBoard', board_info.board,
                                                  $scope, $scope.game);
              },
              () => {
                if(R.isEmpty(R.pathOr([], ['terrain','terrains'], board_info))) {
                  return null;
                }
                return R.pipeP(
                  () => {
                    return $scope.doResetTerrain();
                  },
                  () => {
                    return gameService
                      .executeCommand('createTerrain', board_info.terrain, false,
                                      $scope, $scope.game);
                  }
                )();
              }
            )();
          }
        )(files[0]).catch((reason) => {
          $scope.gameEvent('modeActionError', reason);
          return self.Promise.reject(reason);
        });
      };
    }
  ]);
