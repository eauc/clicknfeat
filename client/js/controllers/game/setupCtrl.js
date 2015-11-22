'use strict';

angular.module('clickApp.controllers')
  .controller('gameSetupCtrl', [
    '$scope',
    'gameBoard',
    'gameScenario',
    'gameLayers',
    'game',
    'gameModels',
    'gameFactions',
    function($scope,
             gameBoardService,
             gameScenarioService,
             gameLayersService,
             gameService,
             gameModelsService,
             gameFactionsService) {
      console.log('init gameSetupCtrl');

      $scope.$watch('game.board.name', function(value) {
        $scope.board_name = value;
      });
      $scope.doSetBoard = function doSetBoard() {
        var board = gameBoardService.forName($scope.board_name, $scope.boards);
        $scope.doExecuteCommand('setBoard', board);
      };
      $scope.doSetRandomBoard = function doSetRandomBoard() {
        var board, name = gameBoardService.name($scope.game.board);
        while(name === gameBoardService.name($scope.game.board)) {
          board = $scope.boards[R.randomRange(0, $scope.boards.length-1)];
          name = gameBoardService.name(board);
        }
        $scope.board_name = name;
        $scope.doSetBoard();
      };

      $scope.$watch('game.scenario.name', function(value) {
        $scope.scenario_name = value;
        $scope.scenario_group = gameScenarioService.groupForName($scope.scenario_name,
                                                                 $scope.scenarios);
      });
      $scope.doSetScenario = function doSetScenario() {
        var scenario = gameScenarioService.forName($scope.scenario_name,
                                                   $scope.scenario_group);
        $scope.doExecuteCommand('setScenario', scenario);
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
      // $scope.doGenerateObjectives = function doGenerateObjectives() {
      //   var previous = R.pipe(
      //     gameModelsService.all,
      //     R.filter(function(m) {
      //       var info = gameFactionsService.getModelInfo(m.state.info, $scope.factions);
      //       return ( info.type === 'objective' ||
      //                info.type === 'flag'
      //              );
      //     }),
      //     R.map(R.path(['state','stamp']))
      //   )($scope.game.models);
      //   if(!R.isEmpty(previous)) {
      //     $scope.doExecuteCommand('deleteModel', previous);
      //   }
        
      //   var objectives = R.map(function(o) {
      //     return {
      //       info: R.concat(['scenario','models'], o.path),
      //       x: o.x, y: o.y
      //     };
      //   }, R.defaultTo([], $scope.game.scenario.objectives));
      //   var flags = R.map(function(o) {
      //     return {
      //       info: R.concat(['scenario','models'], o.path),
      //       x: o.x, y: o.y
      //     };
      //   }, R.defaultTo([], $scope.game.scenario.flags));
      //   var create = {
      //     base: { x: 0, y: 0 },
      //     models: R.concat(objectives, flags)
      //   };
      //   if(!R.isEmpty(create.models)) {
      //     $scope.doExecuteCommand('createModel', create);
      //   }
      // };

      // $scope.isLayerDisplayed = function isLayerDisplayed(l) {
      //   return gameLayersService.isDisplayed(l, R.defaultTo({}, $scope.game).layers);
      // };
      $scope.doToggleLayer = function doToggleLayer(l) {
        $scope.doExecuteCommand('setLayers', 'toggle', l);
      };
    }
  ]);
