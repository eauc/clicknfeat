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

      $scope.$watch('game.undo', function() {
        $scope.$broadcast('logReplayList');
      });
      $scope.digestOnGameEvent('command', $scope);
    }
  ]);
