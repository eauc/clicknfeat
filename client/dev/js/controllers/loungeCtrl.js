'use strict';

angular.module('clickApp.controllers').controller('loungeCtrl', ['$scope', function ($scope) {
  console.log('init loungeCtrl');

  $scope.onStateChangeEvent('Games.local.load', function (event, id) {
    $scope.goToState('game.main', {
      online: 'offline',
      private: 'private',
      id: id
    });
    $scope.$digest();
  }, $scope);

  $scope.local_games_selection = {};
  $scope.digestOnStateChangeEvent('Games.local.change', $scope);
  $scope.doCreateLocalGame = function () {
    $scope.stateEvent('Games.local.create');
  };
  $scope.doLoadLocalGame = function () {
    $scope.stateEvent('Games.local.load', $scope.local_games_selection.list[0]);
  };
  $scope.doOpenLocalGameFile = function (files) {
    $scope.stateEvent('Games.local.loadFile', files[0]);
  };
  $scope.doDeleteLocalGame = function () {
    $scope.stateEvent('Games.local.delete', $scope.local_games_selection.list[0]);
  };

  // $scope.online_games_selection = {};
  // function loadNewOnlineGame(game) {
  //   return R.pipeP(
  //     gamesService.newOnlineGame,
  //     function(game) {
  //       $scope.goToState('game', {
  //         online: 'online',
  //         private: 'private',
  //         id: game.private_stamp,
  //       });
  //     }
  //   )(game);
  // }
  // $scope.doCreateOnlineGame = function() {
  //   var game = gameService.create($scope.user.state);
  //   return loadNewOnlineGame(game);
  // };
  // $scope.doOpenOnlineGameFile = function(files) {
  //   return R.pipeP(
  //     fileImportService.read$('json'),
  //     loadNewOnlineGame
  //   )(files[0])
  //     .catch(function() {
  //       console.log('Failed to open online game file');
  //     });
  // };
  // $scope.doLoadOnlineGame = function() {
  //   var game_index = $scope.online_games_selection.list[0];
  //   var stamp = R.propOr('null', 'public_stamp', $scope.user.connection.games[game_index]);
  //   $scope.goToState('game', {
  //     online: 'online',
  //     private: 'public',
  //     id: stamp
  //   });
  // };

  $scope.doUserToggleOnline = function () {
    $scope.stateEvent('User.toggleOnline');
  };
}]);
//# sourceMappingURL=loungeCtrl.js.map
