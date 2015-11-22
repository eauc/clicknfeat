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

      $scope.user_ready
        .then(function onUserReady() {
          $scope.user_desc = userService.description($scope.user);
        });
      
      gamesService.loadLocalGames()
        .then(function(games) {
          $scope.local_games = games;
        });

      $scope.local_games_selection = [];
      $scope.isInLocalGamesSelection = function(index) {
        return R.exists(R.find(R.equals(index), $scope.local_games_selection));
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
        gamesService.newLocalGame(game, $scope.local_games)
          .then(function onNewLocalGame(games) {
            $scope.local_games = games;
            $scope.goToState('game', { where: 'offline', id: R.length($scope.local_games)-1 });
            $scope.$digest();
          });
      }
      $scope.doCreateLocalGame = function() {
        var game = gameService.create($scope.user);
        loadNewLocalGame(game);
      };
      $scope.doOpenLocalGameFile = function(files) {
        fileImportService.read('json', files[0])
          .then(function(game) {
            loadNewLocalGame(game);
          })
          .catch(function() {
            console.log('Failed to open local game file');
          });
      };
      $scope.doLoadLocalGame = function() {
        $scope.goToState('game', { where: 'offline', id: $scope.local_games_selection[0] });
      };
      $scope.doDeleteLocalGame = function() {
        gamesService.removeLocalGame($scope.local_games_selection[0],
                                     $scope.local_games)
          .then(function onRemoveLocalGame(games) {
            $scope.local_games = games;
            $scope.setLocalGamesSelection($scope.local_games_selection[0]);
            $scope.$digest();
          });
      };
    }
  ]);
