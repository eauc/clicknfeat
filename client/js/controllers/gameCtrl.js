'use strict';

angular.module('clickApp.controllers')
  .controller('gameCtrl', [
    '$scope',
    '$state',
    '$stateParams',
    'game',
    'games',
    'modes',
    'allModes',
    'allCommands',
    function($scope,
             $state,
             $stateParams,
             gameService,
             gamesService,
             modesService) {
      console.log('init gameCtrl', $stateParams, $state.current.name);
      if($stateParams.where === 'offline') {
        $scope.local_games = gamesService.loadLocalGames();
        $scope.game_index = $stateParams.id >> 0;
        $scope.game = R.nth($scope.game_index,
                            $scope.local_games);
        console.log('load game', $scope.game);
      }
      if(R.isNil($scope.game)) {
        $scope.goToState('lounge');
        return;
      }
      if($state.current.name === 'game') {
        $scope.goToState('.main');
      }

      $scope.gameEvent = function gameEvent() {
        var args = Array.prototype.slice.apply(arguments);
        console.log('gameEvent', args);
        $scope.$broadcast.apply($scope, args);
      };

      $scope.saveGame = function saveGame(game) {
        $scope.game = game;
        console.log('save game', $scope.game);
        $scope.local_games[$scope.game_index] = $scope.game;
        gamesService.storeLocalGames($scope.local_games);
      };

      $scope.modes = modesService.init($scope);
      $scope.doModeAction = function doModeAction(action) {
        modesService.currentModeAction($scope.modes, action, $scope);
      };
      $scope.show_action_group = null;
      $scope.doActionButton = function doActionButton(action) {
        if(action[1] === 'toggle') {
          $scope.show_action_group = ($scope.show_action_group === action[2]) ? null : action[2];
          return;
        }
        $scope.doModeAction(action[1]);
      };

      $scope.$on('clickMap', function onMapClick(event, coord, click) {
        console.log('$on clickMap', arguments);
      });

      $scope.game = gameService.load($scope, $scope.game);
    }
  ]);
