(function() {
  angular.module('clickApp.controllers')
    .controller('loungeCtrl', loungeCtrl);

  loungeCtrl.$inject = [
    '$scope',
  ];
  function loungeCtrl($scope) {
    const vm = this;
    console.log('init loungeCtrl');

    vm.localGamesIsEmpty = localGamesIsEmpty;
    vm.doCreateLocalGame = doCreateLocalGame;
    vm.doLoadLocalGame = doLoadLocalGame;
    vm.doOpenLocalGameFile = doOpenLocalGameFile;
    vm.doDeleteLocalGame = doDeleteLocalGame;

    vm.doUserToggleOnline = doUserToggleOnline;
    vm.doCreateOnlineGame = doCreateOnlineGame;
    vm.doLoadOnlineGame = doLoadOnlineGame;
    vm.doOpenOnlineGameFile = doOpenOnlineGameFile;

    activate();

    function activate() {
      vm.local_games_selection = {};
      vm.online_games_selection = {};
      $scope.digestOnStateChangeEvent('Games.local.change', $scope);
      $scope.onStateChangeEvent('Games.local.load', onGamesLocalLoad, $scope);
      $scope.onStateChangeEvent('Games.online.load', onGamesOnlineLoad, $scope);
    }

    function localGamesIsEmpty() {
      const ret = ( R.isEmpty($scope.state.local_games) ||
                    R.isEmpty(vm.local_games_selection.list)
                  );
      return ret;
    }
    function doCreateLocalGame() {
      $scope.stateEvent('Games.local.create');
    }
    function doLoadLocalGame() {
      const id = R.thread($scope.state.local_games)(
        R.nth(vm.local_games_selection.list[0]),
        R.prop('local_stamp')
      );
      console.log('load', $scope.state.local_games,
                  vm.local_games_selection.list[0], id);
      $scope.stateEvent('Games.local.load', id);
    }
    function doOpenLocalGameFile(files) {
      $scope.stateEvent('Games.local.loadFile', files[0]);
    }
    function doDeleteLocalGame() {
      const id = R.thread($scope.state.local_games)(
        R.nth(vm.local_games_selection.list[0]),
        R.prop('local_stamp')
      );
      $scope.stateEvent('Games.local.delete', id);
    }
    function onGamesLocalLoad(_event_, id) {
      $scope.goToState('game.main', {
        online: 'offline',
        private: 'private',
        id: id
      });
      $scope.$digest();
    }

    function doUserToggleOnline() {
      $scope.stateEvent('User.toggleOnline');
    }
    function doCreateOnlineGame() {
      $scope.stateEvent('Games.online.create');
    }
    function doLoadOnlineGame() {
      R.thread($scope.state)(
        R.pathOr([], ['user','connection','games']),
        R.nth(vm.online_games_selection.list[0]),
        R.defaultTo({}),
        R.propOr('null', 'public_stamp'),
        (id) => {
          $scope.stateEvent('Games.online.load', id);
        }
      );
    }
    function doOpenOnlineGameFile(files) {
      $scope.stateEvent('Games.online.loadFile', files[0]);
    }
    function onGamesOnlineLoad(_event_, isPrivate, id) {
      $scope.goToState('game.main', {
        online: 'online',
        private: isPrivate,
        id: id
      });
      $scope.$digest();
    }
  }
})();
