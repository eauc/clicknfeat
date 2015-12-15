'use strict';

angular.module('clickApp.controllers').controller('gameMainCtrl', ['$scope', 'game', function ($scope, gameService) {
  console.log('init gameMainCtrl');

  $scope.hints.go_to_main = false;

  $scope.doUseRuler = function doUseRuler() {
    if ($scope.currentModeIs('Ruler')) {
      $scope.doModeAction('modeBackToDefault');
    } else {
      $scope.doModeAction('enterRulerMode');
    }
  };
  $scope.doToggleShowRuler = function doToggleShowRuler() {
    $scope.doExecuteCommand('setRuler', 'toggleDisplay');
  };
  $scope.digestOnGameEvent('changeRemoteRuler', $scope);

  $scope.doUseLos = function doUseLos() {
    if ($scope.currentModeIs('LoS')) {
      $scope.doModeAction('modeBackToDefault');
    } else {
      $scope.doModeAction('enterLosMode');
    }
  };
  $scope.doToggleShowLos = function doToggleShowLos() {
    $scope.doExecuteCommand('setLos', 'toggleDisplay');
  };
  $scope.digestOnGameEvent('changeRemoteLos', $scope);

  $scope.doCreateTemplate = function doCreateTemplate(type) {
    $scope.create.template = { type: type, x: 240, y: 240 };
    $scope.doSwitchToMode('CreateTemplate', $scope, $scope.modes);
  };

  $scope.doRollDice = function doRoll(sides, nb_dice) {
    $scope.doExecuteCommand('rollDice', sides, nb_dice);
  };

  $scope.chat = { msg: '' };
  $scope.doSendChatMessage = function () {
    var msg = s.trim($scope.chat.msg);
    if (R.isEmpty(msg)) return;

    R.pipeP(gameService.sendChat$(R.path(['user', 'state', 'name'], $scope), msg), function () {
      $scope.chat.msg = '';
      $scope.$digest();
    })($scope.game);
  };
  $scope.digestOnGameEvent('chat', $scope);
}]);
//# sourceMappingURL=mainCtrl.js.map
