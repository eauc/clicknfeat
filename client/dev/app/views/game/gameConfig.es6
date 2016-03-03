(function() {
  angular.module('clickApp')
    .config(gameRoutes);

  gameRoutes.$inject = [
    '$stateProvider',
  ];
  function gameRoutes($stateProvider) {
    $stateProvider
      .state('game', {
        abstract: true,
        url: '/game/:online/:private/:id',
        templateUrl: 'app/views/game/game.html',
        controller: 'gameCtrl',
        controllerAs: 'game'
      })
      .state('game.main', {
        url: '/main',
        templateUrl: 'app/views/game/main/game_main.html',
        controller: 'gameMainCtrl',
        controllerAs: 'game_main',
        data: { hide_nav: true }
      })
      // .state('game.model', {
      //   url: '/model',
      //   templateUrl: 'partials/game/model.html',
      //   controller: 'gameModelCtrl',
      //   data: { hide_nav: true }
      // })
      .state('game.setup', {
        url: '/setup',
        templateUrl: 'app/views/game/setup/game_setup.html',
        controller: 'gameSetupCtrl',
        controllerAs: 'game_setup',
        data: { hide_nav: true }
      })
      .state('game.save', {
        url: '/save',
        templateUrl: 'app/views/game/save/game_save.html',
        controller: 'gameSaveCtrl',
        controllerAs: 'game_save',
        data: { hide_nav: true }
      })
      .state('game.help', {
        url: '/help',
        templateUrl: 'app/views/game/help/game_help.html',
        controller: 'gameHelpCtrl',
        controllerAs: 'game_help',
        data: { hide_nav: true }
      })
      .state('game.log', {
        url: '/log',
        templateUrl: 'app/views/game/log/game_log.html',
        controller: 'gameLogCtrl',
        controllerAs: 'log',
        data: { hide_nav: true }
      })
      // .state('game.online', {
      //   url: '/online',
      //   templateUrl: 'partials/game/online.html',
      //   controller: 'gameOnlineCtrl',
      //   data: { hide_nav: true }
      // })
    ;
  }
})();
