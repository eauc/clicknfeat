(function() {
  angular.module('clickApp.controllers')
    .controller('loungeCtrl', loungeCtrl);

  loungeCtrl.$inject = [
    '$scope',
    'appGames',
  ];
  function loungeCtrl($scope,
                      appGamesService) {
    const vm = this;
    console.log('init loungeCtrl');

    vm.doUserToggleOnline = doUserToggleOnline;

    vm.localGamesIsEmpty = localGamesIsEmpty;
    vm.doCreateLocalGame = doCreateLocalGame;
    vm.doLoadLocalGame = doLoadLocalGame;
    vm.doOpenLocalGameFile = doOpenLocalGameFile;
    vm.doDeleteLocalGame = doDeleteLocalGame;

    vm.doCreateOnlineGame = doCreateOnlineGame;
    vm.doLoadOnlineGame = doLoadOnlineGame;
    vm.doOpenOnlineGameFile = doOpenOnlineGameFile;

    activate();

    function activate() {
      vm.local_games_selection = {};
      vm.online_games_selection = {};
      $scope.listenSignal(onGamesLocalLoadSuccess,
                          appGamesService.load.local, $scope);
      $scope.listenSignal(onGamesOnlineLoadSuccess,
                          appGamesService.load.online, $scope);
    }

    function doUserToggleOnline() {
      $scope.sendAction('User.toggleOnline');
    }

    function localGamesIsEmpty() {
      const ret = ( R.isEmpty($scope.state.local_games) ||
                    R.isEmpty(vm.local_games_selection.list)
                  );
      return ret;
    }
    function doCreateLocalGame() {
      $scope.sendAction('Games.local.create');
    }
    function doLoadLocalGame() {
      const id = R.thread($scope.state.local_games)(
        R.nth(vm.local_games_selection.list[0]),
        R.prop('local_stamp')
      );
      $scope.sendAction('Games.local.load', id);
    }
    function doOpenLocalGameFile(files) {
      $scope.sendAction('Games.local.loadFile', files[0]);
    }
    function doDeleteLocalGame() {
      const id = R.thread($scope.state.local_games)(
        R.nth(vm.local_games_selection.list[0]),
        R.prop('local_stamp')
      );
      $scope.sendAction('Games.local.delete', id);
    }
    function onGamesLocalLoadSuccess(id) {
      console.warn('load local game success', id);
      $scope.app.goToState('game.main', {
        online: 'offline',
        private: 'private',
        id: id
      });
    }

    function doCreateOnlineGame() {
      $scope.sendAction('Games.online.create');
    }
    function doLoadOnlineGame() {
      $scope.sendAction('Games.online.load', vm.online_games_selection.list[0]);
    }
    function doOpenOnlineGameFile(files) {
      $scope.sendAction('Games.online.loadFile', files[0]);
    }
    function onGamesOnlineLoadSuccess([is_private, id]) {
      console.warn('load online game success', arguments, id, is_private);
      $scope.app.goToState('game.main', {
        online: 'online',
        private: is_private,
        id: id
      });
    }
  }
})();
