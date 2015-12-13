'use strict';

angular.module('clickApp.controllers').controller('loungeCtrl', ['$scope', 'user', 'game', 'games', 'fileImport', function ($scope, userService, gameService, gamesService, fileImportService) {
  console.log('init loungeCtrl');

  gamesService.loadLocalGames().then(function (games) {
    $scope.local_games = games;
  });

  $scope.local_games_selection = {};
  function loadNewLocalGame(game) {
    return R.pipeP(gamesService.newLocalGame$(game), function (games) {
      $scope.local_games = games;
      $scope.goToState('game', {
        online: 'offline',
        private: 'private',
        id: R.length($scope.local_games) - 1
      });
      $scope.$digest();
    })($scope.local_games);
  }
  $scope.doCreateLocalGame = function () {
    var game = gameService.create($scope.user.state);
    return loadNewLocalGame(game);
  };
  $scope.doOpenLocalGameFile = function (files) {
    return R.pipeP(fileImportService.read$('json'), loadNewLocalGame)(files[0]).catch(function () {
      console.log('Failed to open local game file');
    });
  };
  $scope.doLoadLocalGame = function () {
    $scope.goToState('game', {
      online: 'offline',
      private: 'private',
      id: $scope.local_games_selection.list[0]
    });
  };
  $scope.doDeleteLocalGame = function () {
    return R.pipeP(gamesService.removeLocalGame$($scope.local_games_selection.list[0]), function (games) {
      $scope.local_games = games;
      $scope.setLocalGamesSelection($scope.local_games_selection.list[0]);
      $scope.$digest();
    })($scope.local_games);
  };

  $scope.online_games_selection = {};
  function loadNewOnlineGame(game) {
    return R.pipeP(gamesService.newOnlineGame, function (game) {
      $scope.goToState('game', {
        online: 'online',
        private: 'private',
        id: game.private_stamp
      });
    })(game);
  }
  $scope.doCreateOnlineGame = function () {
    var game = gameService.create($scope.user.state);
    return loadNewOnlineGame(game);
  };
  $scope.doOpenOnlineGameFile = function (files) {
    return R.pipeP(fileImportService.read$('json'), loadNewOnlineGame)(files[0]).catch(function () {
      console.log('Failed to open online game file');
    });
  };
  $scope.doLoadOnlineGame = function () {
    var game_index = $scope.online_games_selection.list[0];
    var stamp = R.propOr('null', 'public_stamp', $scope.user.connection.games[game_index]);
    $scope.goToState('game', {
      online: 'online',
      private: 'public',
      id: stamp
    });
  };

  $scope.doUserToggleOnline = function () {
    return R.pipeP(userService.toggleOnline, $scope.setUser)($scope.user);
  };
}]);
//# sourceMappingURL=loungeCtrl.js.map
