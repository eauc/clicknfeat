(function() {
  angular.module('clickApp.controllers')
    .controller('loungeCtrl', loungeCtrl);

  loungeCtrl.$inject = [
    '$scope',
  ];
  function loungeCtrl($scope) {
    const vm = this;
    console.log('init loungeCtrl');

    vm.local_games_selection = {};
    vm.localGamesIsEmpty = localGamesIsEmpty;
    vm.doCreateLocalGame = doCreateLocalGame;
    vm.doLoadLocalGame = doLoadLocalGame;
    vm.doOpenLocalGameFile = doOpenLocalGameFile;
    vm.doDeleteLocalGame = doDeleteLocalGame;
    vm.doUserToggleOnline = doUserToggleOnline;

    activate();

    function activate() {
      $scope.digestOnStateChangeEvent('Games.local.change', $scope);
      $scope.onStateChangeEvent('Games.local.load', onGamesLocalLoad, $scope);
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
      let id = R.thread($scope.state.local_games)(
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

    // $scope.doUserToggleOnline = function() {
    //   $scope.stateEvent('User.toggleOnline');
    // };
  }
})();
