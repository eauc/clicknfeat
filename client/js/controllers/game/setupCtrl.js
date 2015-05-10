'use strict';

angular.module('clickApp.controllers')
  .controller('gameSetupCtrl', [
    '$scope',
    'gameBoard',
    'gameScenario',
    'game',
    function($scope,
             gameBoardService,
             gameScenarioService,
             gameService) {
      console.log('init gameSetupCtrl');

      $scope.board_name = gameBoardService.name($scope.game.board);
      $scope.$on('changeBoard', function() {
        $scope.board_name = gameBoardService.name($scope.game.board);
      });
      $scope.doSetBoard = function doSetBoard() {
        var board = gameBoardService.forName($scope.board_name,
                                             $scope.boards);
        gameService.executeCommand('setBoard',
                                   board,
                                   $scope,
                                   $scope.game);
      };
      $scope.doSetRandomBoard = function doSetRandomBoard() {
        var board, name = $scope.board_name;
        while(name === $scope.board_name) {
          board = $scope.boards[R.randomRange(0, $scope.boards.length-1)];
          name = gameBoardService.name(board);
        }
        $scope.board_name = name;
        $scope.doSetBoard();
      };

      $scope.scenario_name = gameScenarioService.name($scope.game.scenario);
      $scope.scenario_group = gameScenarioService.groupForName($scope.scenario_name,
                                                               $scope.scenarios);
      $scope.$on('changeScenario', function() {
        $scope.scenario_name = gameScenarioService.name($scope.game.scenario);
        $scope.scenario_group = gameScenarioService.groupForName($scope.scenario_name,
                                                                 $scope.scenarios);
      });
      $scope.doSetScenario = function doSetScenario() {
        var scenario = gameScenarioService.forName($scope.scenario_name,
                                                   $scope.scenario_group);
        gameService.executeCommand('setScenario',
                                   scenario,
                                   $scope,
                                   $scope.game);
      };
      $scope.doSetRandomScenario = function doSetRandomScenario() {
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
    }
  ]);
