'use strict';

angular.module('clickApp.controllers').controller('gameSetupCtrl', ['$scope', 'game', 'gameBoard', 'gameScenario', 'gameModels', function ($scope, gameService, gameBoardService, gameScenarioService, gameModelsService) {
  console.log('init gameSetupCtrl');

  $scope.$watch('game.board.name', function (value) {
    $scope.board_name = value;
  });
  $scope.doSetBoard = function doSetBoard() {
    var board = gameBoardService.forName($scope.board_name, $scope.boards);
    $scope.doExecuteCommand('setBoard', board);
  };
  $scope.doSetRandomBoard = function doSetRandomBoard() {
    var board,
        name = gameBoardService.name($scope.game.board);
    while (name === gameBoardService.name($scope.game.board)) {
      board = $scope.boards[R.randomRange(0, $scope.boards.length - 1)];
      name = gameBoardService.name(board);
    }
    $scope.board_name = name;
    $scope.doSetBoard();
  };

  $scope.$watch('game.scenario.name', function (value) {
    $scope.scenario_name = value;
    $scope.scenario_group = gameScenarioService.groupForName($scope.scenario_name, $scope.scenarios);
  });
  $scope.doSetScenario = function doSetScenario() {
    var scenario = gameScenarioService.forName($scope.scenario_name, $scope.scenario_group);
    $scope.doExecuteCommand('setScenario', scenario);
  };
  $scope.doSetRandomScenario = function doSetRandomScenario() {
    var group = gameScenarioService.group('SR15', $scope.scenarios);
    var scenario,
        name = $scope.scenario_name;
    while (name === $scope.scenario_name) {
      scenario = group[1][R.randomRange(0, group[1].length - 1)];
      name = gameScenarioService.name(scenario);
    }
    $scope.scenario_group = group;
    $scope.scenario_name = name;
    $scope.doSetScenario();
  };
  $scope.doGenerateObjectives = function () {
    R.pipePromise(function () {
      return gameModelsService.all($scope.game.models);
    }, R.filter(R.pipe(R.path(['state', 'info']), R.head, R.equals('scenario'))), R.map(R.path(['state', 'stamp'])), function (stamps) {
      return gameService.executeCommand('deleteModel', stamps, $scope, $scope.game).catch(R.always(null));
    }, function () {
      return gameScenarioService.createObjectives($scope.game.scenario);
    }, function (objectives) {
      var is_flipped = R.path(['ui_state', 'flip_map'], $scope);
      return gameService.executeCommand('createModel', objectives, is_flipped, $scope, $scope.game);
    })();
  };

  $scope.doToggleLayer = function doToggleLayer(l) {
    $scope.doExecuteCommand('setLayers', 'toggle', l);
  };
}]);
//# sourceMappingURL=setupCtrl.js.map
