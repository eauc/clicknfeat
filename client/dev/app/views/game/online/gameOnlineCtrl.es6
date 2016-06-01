(function() {
  angular.module('clickApp.controllers')
    .controller('gameOnlineCtrl', gameOnlineCtrl);

  gameOnlineCtrl.$inject = [
    '$scope',
    'appGames',
    'appUser',
  ];
  function gameOnlineCtrl($scope,
                          appGamesService,
                          appUserService) {
    const vm = this;
    console.log('init gameOnlineCtrl');

    vm.doLoadOnlineGame = doLoadOnlineGame;

    activate();

    function activate() {
      vm.games_selection = {};

      $scope.listenSignal(onGamesOnlineLoadSuccess,
                          appGamesService.load.online, $scope);
      appUserService.ready.then(() => {
        $scope.bindCell(checkUserOnline, appUserService.online, $scope);
      });
    }

    function checkUserOnline(is_online) {
      if(!is_online) {
        $scope.app.goToState('^.main');
      }
    }

    function doLoadOnlineGame() {
      $scope.sendAction('Games.online.load', vm.games_selection.list[0]);
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
