'use strict';

angular.module('clickApp.controllers')
  .controller('loungeCtrl', [
    '$scope',
    'user',
    'game',
    'games',
    function($scope,
             userService,
             gameService,
             gamesService) {
      console.log('init loungeCtrl');
      $scope.checkUser();

      $scope.user_desc = userService.description($scope.user);
      gamesService.loadLocalGames()
        .then(function(local_games) {
          $scope.local_games = local_games;
        });

      $scope.local_games_selection = [];
      $scope.isInLocalGamesSelection = function(index) {
        return R.exists(R.find(R.eq(index), $scope.local_games_selection));
      };
      $scope.localGamesSelectionIsEmpty = function() {
        return R.isEmpty($scope.local_games_selection);
      };
      $scope.setLocalGamesSelection = function(index) {
        $scope.local_games_selection = [index];
        console.log('local_games_selection', $scope.local_games_selection);
      };

      $scope.doCreateLocalGame = function doCreateLocalGame() {
        var game = gameService.create($scope.user);
        var index = R.length($scope.local_games);

        $scope.local_games = R.append(game, $scope.local_games);
        gamesService.storeLocalGames($scope.local_games);

        $scope.goToState('game', { where: 'offline', id: index });
      };
      $scope.doLoadLocalGame = function doLoadLocalGame() {
        $scope.goToState('game', { where: 'offline', id: $scope.local_games_selection[0] });
      };
      $scope.doDeleteLocalGame = function doDeleteLocalGame() {
        $scope.local_games = R.remove($scope.local_games_selection[0], 1,
                                      $scope.local_games);
        gamesService.storeLocalGames($scope.local_games);
      };
    }
  ]);
