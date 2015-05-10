'use strict';

angular.module('clickApp.controllers')
  .controller('gameMainCtrl', [
    '$scope',
    'game',
    function($scope,
             gameService) {
      console.log('init gameMainCtrl');

      $scope.digestOnGameEvent($scope, 'diceRoll');
      $scope.doRollDice = function doRoll(sides, nb_dice) {
        gameService.executeCommand('rollDice',
                                   sides, nb_dice,
                                   $scope, $scope.game);
      };
    }
  ]);
