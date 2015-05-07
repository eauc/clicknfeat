'use strict';

angular.module('clickApp.services', []);
angular.module('clickApp.controllers', []);
angular.module('clickApp', [
  'ui.router',
  'clickApp.controllers',
  'clickApp.services',
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
    ;
  }
]).config([
  '$compileProvider',
  function($compileProvider) {   
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|blob):/);
  }
]);
