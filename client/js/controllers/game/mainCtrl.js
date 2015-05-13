'use strict';

angular.module('clickApp.controllers')
  .controller('gameMainCtrl', [
    '$scope',
    'game',
    'modes',
    function($scope,
             gameService,
             modesService) {
      console.log('init gameMainCtrl');

      $scope.doCreateTemplate = function doCreateTemplate(type) {
        $scope.create.template = { type: type, x: 240, y: 240 };
        modesService.switchToMode('CreateTemplate', $scope, $scope.modes);
      };

      $scope.digestOnGameEvent($scope, 'diceRoll');
      $scope.doRollDice = function doRoll(sides, nb_dice) {
        gameService.executeCommand('rollDice',
                                   sides, nb_dice,
                                   $scope, $scope.game);
      };
    }
  ]);
