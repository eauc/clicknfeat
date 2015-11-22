'use strict';

angular.module('clickApp.controllers')
  .controller('gameLogCtrl', [
    '$scope',
    '$window',
    'game',
    function($scope,
             $window,
             gameService) {
      console.log('init gameLogCtrl');

      $scope.digestOnGameEvent('command', $scope);
    }
  ]);
