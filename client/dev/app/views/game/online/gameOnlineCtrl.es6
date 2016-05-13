(function() {
  angular.module('clickApp.controllers')
    .controller('gameOnlineCtrl', gameOnlineCtrl);

  gameOnlineCtrl.$inject = [
    '$scope',
    'user',
  ];
  function gameOnlineCtrl($scope,
                          userModel) {
    const vm = this;
    console.log('init gameOnlineCtrl');

    vm.doLoadOnlineGame = doLoadOnlineGame;

    activate();

    function activate() {
      vm.games_selection = {};

      $scope.onStateChangeEvent('Games.online.load', onGamesOnlineLoad, $scope);
      $scope.state.user_ready
        .then(checkUserOnline);
    }

    function checkUserOnline() {
      if(!userModel.online($scope.state.user)) {
        $scope.app.goToState('^.main');
      }
    }

    function doLoadOnlineGame() {
      R.thread($scope.state)(
        R.pathOr([], ['user','connection','games']),
        R.nth(vm.games_selection.list[0]),
        R.defaultTo({}),
        R.propOr('null', 'public_stamp'),
        (id) => {
          $scope.stateEvent('Games.online.load', id);
        }
      );
    }
    function onGamesOnlineLoad(_event_, isPrivate, id) {
      $scope.app.goToState('game.main', {
        online: 'online',
        private: isPrivate,
        id: id
      });
      $scope.$digest();
    }
  }
})();
