'use strict';

angular.module('clickApp.controllers')
  .controller('gameCtrl', [
    '$scope',
    '$stateParams',
    'games',
    function($scope,
             $stateParams,
             gamesService) {
      console.log('init gameCtrl', $stateParams);
      if($stateParams.where === 'offline') {
        $scope.local_games = gamesService.loadLocalGames();
        $scope.game_index = $stateParams.id >> 0;
        $scope.game = R.nth($scope.game_index, $scope.local_games);
      }
      if(R.isNil($scope.game)) {
        $scope.goToState('lounge');
        return;
      }
    }
  ]);
