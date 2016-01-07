angular.module('clickApp.controllers')
  .controller('gameSetupCtrl', [
    '$scope',
    'gameBoard',
    'gameScenario',
    function($scope,
             gameBoardService,
             gameScenarioService) {
      console.log('init gameSetupCtrl');

      $scope.$on('$destroy', () => {
        $scope.state.changeEvent('Game.scenario.refresh');
      });
      $scope.state.changeEvent('Game.scenario.refresh');

      $scope.state.data_ready.then(() => {
        $scope.boards = $scope.state.boards;
        $scope.terrains = $scope.state.terrains;
        $scope.scenarios = $scope.state.scenarios;
        $scope.ambiance = R.head(R.keys($scope.terrains));
        $scope.onAmbianceChange();
        $scope.$digest();
      });

      function updateBoardName() {
        $scope.board_name = R.path(['state','game','board','name'], $scope);
        $scope.$digest();
      }
      $scope.onStateChangeEvent('Game.board.change', updateBoardName, $scope);
      // $scope.onStateChangeEvent('Game.load.success', updateBoardName, $scope);
      self.requestAnimationFrame(updateBoardName);

      $scope.doSetBoard = () => {
        $scope.stateEvent('Game.board.set', $scope.board_name);
      };
      $scope.doSetRandomBoard = () => {
        $scope.stateEvent('Game.board.setRandom');
      };

      function updateScenario() {
        $scope.scenario_name = R.path(['state','game','scenario','name'], $scope);
        $scope.scenario_group = gameScenarioService.groupForName($scope.scenario_name,
                                                                 $scope.scenarios);
        $scope.$digest();
      }
      $scope.onStateChangeEvent('Game.scenario.change', updateScenario, $scope);
      // $scope.onStateChangeEvent('Game.load.success', updateScenario, $scope);
      self.requestAnimationFrame(updateScenario);

      $scope.doSetScenario = () => {
        $scope.stateEvent('Game.scenario.set', $scope.scenario_name, $scope.scenario_group);
      };
      $scope.doSetRandomScenario = () => {
        $scope.stateEvent('Game.scenario.setRandom');
      };
      $scope.doGenerateObjectives = () => {
        $scope.stateEvent('Game.scenario.generateObjectives');
      };

      function updateLayers() {
        $scope.layers = R.path(['state','game','layers'], $scope);
        $scope.$digest();
      }
      $scope.onStateChangeEvent('Game.layers.change', updateLayers, $scope);
      $scope.onStateChangeEvent('Game.load.success', updateLayers, $scope);
      self.requestAnimationFrame(updateLayers);

      $scope.doToggleLayer = (l) => {
        $scope.stateEvent('Game.command.execute',
                          'setLayers', ['toggle', l]);
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
        let terrain_path = getTerrainPath();
        $scope.stateEvent('Game.terrain.create', terrain_path);
      };
      $scope.doResetTerrain = () => {
        $scope.stateEvent('Game.terrain.reset');
      };

      $scope.doImportBoardFile = (files) => {
        $scope.stateEvent('Game.board.importFile', files[0]);
      };
    }
  ]);
