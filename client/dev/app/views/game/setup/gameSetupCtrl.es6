(function() {
  angular.module('clickApp.controllers')
    .controller('gameSetupCtrl', gameSetupCtrl);

  gameSetupCtrl.$inject = [
    '$scope',
    'appGame',
    // 'gameScenario',
  ];
  function gameSetupCtrl($scope,
                         appGameService// ,
                         // gameScenarioService
                        ) {
    const vm = this;
    console.log('init gameSetupCtrl');

    // vm.doSetBoard = doSetBoard;
    // vm.doSetRandomBoard = doSetRandomBoard;
    // vm.doSetScenario = doSetScenario;
    // vm.doSetRandomScenario = doSetRandomScenario;
    // vm.doGenerateObjectives = doGenerateObjectives;
    vm.doToggleLayer = doToggleLayer;
    // vm.onAmbianceChange = onAmbianceChange;
    // vm.onCategoryChange = onCategoryChange;
    // vm.onEntryChange = onEntryChange;
    // vm.getTerrain = getTerrain;
    // vm.doCreateTerrain = doCreateTerrain;
    // vm.doResetTerrain = doResetTerrain;
    // vm.doImportBoardFile = doImportBoardFile;

    activate();

    function activate() {
      $scope.bindCell((game) => {
        // updateBoardName(game);
        // updateScenario(game);
        updateLayers(game);
      }, appGameService.game, $scope);
      // $scope.state.data_ready.then(onDataReady);

      // $scope.$on('$destroy', () => {
      //   $scope.stateEvent('Game.scenario.refresh');
      // });
      // $scope.stateEvent('Game.scenario.refresh');
    }

    // function onDataReady() {
      // vm.ambiance = R.head(R.keys(vm.terrains));
      // vm.onAmbianceChange();
    //   $scope.$digest();
    // }

    // function updateBoardName(game) {
    //   vm.board_name = R.path(['board','name'], game);
    // }
    // function doSetBoard() {
    //   $scope.sendAction('Game.board.set', vm.board_name);
    // }
    // function doSetRandomBoard() {
    //   $scope.sendAction('Game.board.setRandom');
    // }

    // function updateScenario(game) {
    //   vm.scenario_name = R.path(['scenario','name'], game);
    //   vm.scenario_group = gameScenarioService
    //     .groupForName(vm.scenario_name, $scope.state.scenarios);
    // }
    // function doSetScenario() {
    //   if(R.isNil(vm.scenario_name)) return;

    //   $scope.sendAction('Game.scenario.set',
    //                     vm.scenario_name, vm.scenario_group);
    // }
    // function doSetRandomScenario() {
    //   $scope.sendAction('Game.scenario.setRandom');
    // }
    // function doGenerateObjectives() {
    //   $scope.sendAction('Game.scenario.generateObjectives');
    // }

    function updateLayers(game) {
      vm.layers = R.prop('layers', game);
    }
    function doToggleLayer(l) {
      $scope.sendAction('Game.command.execute',
                        'setLayers', ['toggle', l]);
    }

    // function onAmbianceChange() {
    //   vm.category = R.head(R.keys($scope.state.terrains[vm.ambiance]));
    //   vm.onCategoryChange();
    // }
    // function onCategoryChange() {
    //   vm.entry = R.head(R.keys($scope.state.terrains[vm.ambiance][vm.category]));
    //   vm.onEntryChange();
    // }
    // function onEntryChange() {
    // }
    // function getTerrainPath() {
    //   return [ vm.ambiance,
    //            vm.category,
    //            vm.entry
    //          ];
    // }
    // function getTerrain() {
    //   return R.path([
    //     vm.ambiance,
    //     vm.category,
    //     vm.entry
    //   ], $scope.state.terrains);
    // }
    // function doCreateTerrain() {
    //   const terrain_path = getTerrainPath();
    //   $scope.sendAction('Game.terrain.create', terrain_path);
    // }
    // function doResetTerrain() {
    //   $scope.sendAction('Game.terrain.reset');
    // }

    // function doImportBoardFile(files) {
    //   $scope.sendAction('Game.board.importFile', files[0]);
    // }
  }
})();
