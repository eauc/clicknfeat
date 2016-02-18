'use strict';

angular.module('clickApp.controllers').controller('gameOnlineCtrl', ['$scope', 'user', function ($scope, userService) {
  console.log('init gameOnlineCtrl');

  $scope.hints.go_to_online = false;

  $scope.user_ready.then(function () {
    if (!userService.online($scope.user)) {
      $scope.goToState('^.main');
    }
  });

  $scope.online_games_selection = {};
  $scope.doLoadOnlineGame = function () {
    var game_index = $scope.online_games_selection.list[0];
    var stamp = R.propOr('null', 'public_stamp', $scope.user.connection.games[game_index]);
    $scope.stateEvent('Games.online.load', stamp);
  };
}]);
//# sourceMappingURL=onlineCtrl.js.map
