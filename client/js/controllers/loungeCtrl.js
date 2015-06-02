'use strict';

angular.module('clickApp.controllers')
  .controller('loungeCtrl', [
    '$scope',
    'user',
    'game',
    'games',
    'fileImport',
    function($scope,
             userService,
             gameService,
             gamesService,
             fileImportService) {
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
        if(R.isEmpty($scope.local_games)) {
          $scope.local_games_selection = [];
        }
        else {          
          $scope.local_games_selection = [ Math.min(R.length($scope.local_games)-1,
                                                    index)
                                         ];
        }
        console.log('local_games_selection', $scope.local_games_selection);
      };

      function loadNewLocalGame(game) {
        $scope.local_games = gamesService.newLocalGame(game, $scope.local_games);
        $scope.goToState('game', { where: 'offline', id: R.length($scope.local_games)-1 });
      }
      $scope.doCreateLocalGame = function doCreateLocalGame() {
        var game = gameService.create($scope.user);
        loadNewLocalGame(game);
      };
      $scope.doOpenLocalGameFile = function doOpenLocalGameFile(files) {
        fileImportService.read('json', files[0])
          .then(function(game) {
            loadNewLocalGame(game);
          })
          .catch(function() {
            console.log('Failed to open local game file');
          });
      };
      $scope.doLoadLocalGame = function doLoadLocalGame() {
        $scope.goToState('game', { where: 'offline', id: $scope.local_games_selection[0] });
      };
      $scope.doDeleteLocalGame = function doDeleteLocalGame() {
        $scope.local_games = R.remove($scope.local_games_selection[0], 1,
                                      $scope.local_games);
        gamesService.storeLocalGames($scope.local_games);
        $scope.setLocalGamesSelection($scope.local_games_selection[0]);
      };
    }
  ]);
