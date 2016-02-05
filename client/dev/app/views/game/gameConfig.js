'use strict';

(function () {
  angular.module('clickApp').config(gameRoutes);

  gameRoutes.$inject = ['$stateProvider'];
  function gameRoutes($stateProvider) {
    $stateProvider.state('game', {
      abstract: true,
      url: '/game/:online/:private/:id',
      templateUrl: 'app/views/game/game.html',
      controller: 'gameCtrl',
      controllerAs: 'game'
    }).state('game.main', {
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
    // .state('game.setup', {
    //   url: '/setup',
    //   templateUrl: 'partials/game/setup.html',
    //   controller: 'gameSetupCtrl',
    //   data: { hide_nav: true }
    // })
    // .state('game.save', {
    //   url: '/save',
    //   templateUrl: 'partials/game/save.html',
    //   controller: 'gameSaveCtrl',
    //   data: { hide_nav: true }
    // })
    // .state('game.help', {
    //   url: '/help',
    //   templateUrl: 'partials/game/help.html',
    //   controller: 'gameHelpCtrl',
    //   data: { hide_nav: true }
    // })
    // .state('game.log', {
    //   url: '/log',
    //   templateUrl: 'partials/game/log.html',
    //   controller: 'gameLogCtrl',
    //   data: { hide_nav: true }
    // })
    // .state('game.online', {
    //   url: '/online',
    //   templateUrl: 'partials/game/online.html',
    //   controller: 'gameOnlineCtrl',
    //   data: { hide_nav: true }
    // })
    ;
  }
})();
//# sourceMappingURL=gameConfig.js.map
