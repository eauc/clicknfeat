'use strict';

angular.module('clickApp.controllers')
  .controller('loungeCtrl', [
    '$scope',
    '$state',
    'user',
    'game',
    'games',
    function($scope,
             $state,
             userService,
             gameService,
             gamesService) {
      console.log('init loungeCtrl');
      $scope.checkUser();
      $scope.user_desc = userService.description($scope.user);

      $scope.doCreateLocalGame = function doCreateLocalGame() {
        var game = gameService.create($scope.user);
        var game_id = gamesService.storeNewLocalGame(game);
        $state.go('game', { where: 'offline', id: game_id });
      };
    }
  ]);
