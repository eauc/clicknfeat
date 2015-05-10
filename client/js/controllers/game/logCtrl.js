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

      $scope.doUndoLast = function doUndoLast() {
        gameService.undoLastCommand($scope, $scope.game);
      };
      $scope.doReplayNext = function doReplayNext() {
        gameService.replayNextCommand($scope, $scope.game);
      };

      $scope.$watch('game.undo', function() {
        $scope.$broadcast('logReplayList');
      });
      $scope.$on('command', function() {
        $window.requestAnimationFrame(function() {
          $scope.$digest();
        });
      });
    }
  ]);
