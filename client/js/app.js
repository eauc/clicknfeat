'use strict';

angular.module('clickApp.controllers', []);
angular.module('clickApp.directives', []);
angular.module('clickApp.filters', []);
angular.module('clickApp.services', []);
angular.module('clickApp', [
  'ui.router',
  'clickApp.controllers',
  'clickApp.services',
  'clickApp.filters',
  'clickApp.directives',
]).config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/lounge');
    $stateProvider
      .state('lounge', {
        url: '/lounge',
        templateUrl: 'partials/lounge.html',
        controller: 'loungeCtrl',
        data: {}
      })
      .state('user', {
        url: '/user',
        templateUrl: 'partials/user.html',
        controller: 'userCtrl',
        data: {}
      })
      .state('game', {
        url: '/game/:where/:id',
        templateUrl: 'partials/game.html',
        controller: 'gameCtrl',
        data: { hide_nav: true }
      })
      .state('game.main', {
        url: '/main',
        templateUrl: 'partials/game/main.html',
        controller: 'gameMainCtrl',
        data: { hide_nav: true }
      })
      .state('game.setup', {
        url: '/setup',
        templateUrl: 'partials/game/setup.html',
        controller: 'gameSetupCtrl',
        data: { hide_nav: true }
      })
      .state('game.help', {
        url: '/help',
        templateUrl: 'partials/game/help.html',
        controller: 'gameHelpCtrl',
        data: { hide_nav: true }
      })
    ;
  }
]).config([
  '$compileProvider',
  function($compileProvider) {   
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|blob):/);
  }
]);
