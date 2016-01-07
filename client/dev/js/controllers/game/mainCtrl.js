'use strict';

angular.module('clickApp.controllers').controller('gameMainCtrl', ['$scope', function ($scope) {
  console.log('init gameMainCtrl');

  $scope.hints.go_to_main = false;

  $scope.doUseRuler = function () {
    if ($scope.currentModeIs('Ruler')) {
      $scope.doModeAction('modeBackToDefault');
    } else {
      $scope.doModeAction('enterRulerMode');
    }
  };
  $scope.doToggleShowRuler = function () {
    $scope.stateEvent('Game.command.execute', 'setRuler', ['toggleDisplay', []]);
  };
  $scope.digestOnStateChangeEvent('Game.ruler.remote.change', $scope);

  $scope.doUseLos = function () {
    if ($scope.currentModeIs('LoS')) {
      $scope.doModeAction('modeBackToDefault');
    } else {
      $scope.doModeAction('enterLosMode');
    }
  };
  $scope.doToggleShowLos = function () {
    $scope.stateEvent('Game.command.execute', 'setLos', ['toggleDisplay', []]);
  };
  $scope.digestOnStateChangeEvent('Game.los.remote.change', $scope);

  $scope.doCreateTemplate = function (type) {
    $scope.stateEvent('Game.template.create', type);
  };
}]);
//# sourceMappingURL=mainCtrl.js.map
