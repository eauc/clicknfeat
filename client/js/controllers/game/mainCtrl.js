'use strict';

angular.module('clickApp.controllers')
  .controller('gameMainCtrl', [
    '$scope',
    'game',
    'modes',
    'gameRuler',
    function($scope,
             gameService,
             modesService,
             gameRulerService) {
      console.log('init gameMainCtrl');

      $scope.doUseRuler = function doUseRuler() {
        $scope.doModeAction('enterRulerMode');
      };
      $scope.doToggleShowRuler = function doToggleShowRuler() {
        gameService.executeCommand('setRuler', 'toggleDisplay',
                                   $scope,  $scope.game);
      };
      if(R.exists($scope.game)) {
        $scope.ruler_displayed = gameRulerService.isDisplayed($scope.game.ruler);
      }
      $scope.onGameEvent('changeRemoteRuler', function onChangeRemoteRuler(event, ruler) {
        $scope.ruler_displayed = gameRulerService.isDisplayed({ remote: ruler });
        $scope.deferDigest($scope);
      }, $scope);
      
      $scope.doCreateTemplate = function doCreateTemplate(type) {
        $scope.create.template = { type: type, x: 240, y: 240 };
        modesService.switchToMode('CreateTemplate', $scope, $scope.modes);
      };

      $scope.doRollDice = function doRoll(sides, nb_dice) {
        $scope.doExecuteCommand('rollDice', sides, nb_dice);
      };
    }
  ]);
