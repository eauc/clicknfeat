angular.module('clickApp.controllers')
  .controller('gameOnlineCtrl', [
    '$scope',
    'user',
    function($scope,
             userService) {
      console.log('init gameOnlineCtrl');

      // $scope.hints.go_to_online = false;

      // $scope.user_ready.then(() => {
      //   if(!userService.online($scope.user)) {
      //     $scope.goToState('^.main');
      //   }
      // });

      // $scope.online_games_selection = {};
      // $scope.doLoadOnlineGame = () => {
      //   let game_index = $scope.online_games_selection.list[0];
      //   let stamp = R.propOr('null', 'public_stamp', $scope.user.connection.games[game_index]);
      //   $scope.stateEvent('Games.online.load', stamp);
      // };
    }
  ]);
