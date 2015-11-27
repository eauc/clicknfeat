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
        if($scope.currentModeIs('Ruler')) {
          $scope.doModeAction('modeBackToDefault');
        }
        else {
          $scope.doModeAction('enterRulerMode');
        }
      };
      $scope.doToggleShowRuler = function doToggleShowRuler() {
        $scope.doExecuteCommand('setRuler', 'toggleDisplay');
      };
      $scope.digestOnGameEvent('changeRemoteRuler', $scope);
      
      $scope.doCreateTemplate = function doCreateTemplate(type) {
        $scope.create.template = { type: type, x: 240, y: 240 };
        $scope.doSwitchToMode('CreateTemplate', $scope, $scope.modes);
      };

      $scope.doRollDice = function doRoll(sides, nb_dice) {
        $scope.doExecuteCommand('rollDice', sides, nb_dice);
      };
    }
  ]);
