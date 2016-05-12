'use strict';

(function () {
  angular.module('clickApp.controllers').controller('loungeCtrl', loungeCtrl);

  loungeCtrl.$inject = ['$scope', 'appGames'];
  function loungeCtrl($scope, appGamesService) {
    var vm = this;
    console.log('init loungeCtrl');

    vm.doUserToggleOnline = doUserToggleOnline;

    vm.localGamesIsEmpty = localGamesIsEmpty;
    vm.doCreateLocalGame = doCreateLocalGame;
    vm.doLoadLocalGame = doLoadLocalGame;
    vm.doOpenLocalGameFile = doOpenLocalGameFile;
    vm.doDeleteLocalGame = doDeleteLocalGame;

    // vm.doCreateOnlineGame = doCreateOnlineGame;
    // vm.doLoadOnlineGame = doLoadOnlineGame;
    // vm.doOpenOnlineGameFile = doOpenOnlineGameFile;

    activate();

    function activate() {
      vm.local_games_selection = {};
      vm.online_games_selection = {};
      //   $scope.digestOnStateChangeEvent('Games.local.change', $scope);
      //   $scope.digestOnStateChangeEvent('Games.online.change', $scope);
      $scope.listenSignal(onGamesLocalLoadSuccess, appGamesService.load.local, $scope);
      //   $scope.onStateChangeEvent('Games.online.load', onGamesOnlineLoad, $scope);
    }

    function doUserToggleOnline() {
      $scope.sendAction('User.toggleOnline');
    }

    function localGamesIsEmpty() {
      var ret = R.isEmpty($scope.state.local_games) || R.isEmpty(vm.local_games_selection.list);
      return ret;
    }
    function doCreateLocalGame() {
      $scope.sendAction('Games.local.create');
    }
    function doLoadLocalGame() {
      var id = R.thread($scope.state.local_games)(R.nth(vm.local_games_selection.list[0]), R.prop('local_stamp'));
      $scope.sendAction('Games.local.load', id);
    }
    function doOpenLocalGameFile(files) {
      $scope.sendAction('Games.local.loadFile', files[0]);
    }
    function doDeleteLocalGame() {
      var id = R.thread($scope.state.local_games)(R.nth(vm.local_games_selection.list[0]), R.prop('local_stamp'));
      $scope.sendAction('Games.local.delete', id);
    }
    function onGamesLocalLoadSuccess(id) {
      console.warn('load local game success', id);
      $scope.goToState('game.main', {
        online: 'offline',
        private: 'private',
        id: id
      });
    }

    // function doCreateOnlineGame() {
    //   $scope.stateEvent('Games.online.create');
    // }
    // function doLoadOnlineGame() {
    //   R.thread($scope.state)(
    //     R.pathOr([], ['user','connection','games']),
    //     R.nth(vm.online_games_selection.list[0]),
    //     R.defaultTo({}),
    //     R.propOr('null', 'public_stamp'),
    //     (id) => {
    //       $scope.stateEvent('Games.online.load', id);
    //     }
    //   );
    // }
    // function doOpenOnlineGameFile(files) {
    //   $scope.stateEvent('Games.online.loadFile', files[0]);
    // }
    // function onGamesOnlineLoad(_event_, [isPrivate, id]) {
    //   $scope.goToState('game.main', {
    //     online: 'online',
    //     private: isPrivate,
    //     id: id
    //   });
    //   $scope.$digest();
    // }
  }
})();
//# sourceMappingURL=loungeCtrl.js.map
