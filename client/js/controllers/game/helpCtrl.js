'use strict';

angular.module('clickApp.controllers')
  .controller('gameHelpCtrl', [
    '$scope',
    'modes',
    function($scope,
             modesService) {
      console.log('init gameHelpCtrl');
      $scope.current_bindings = modesService.currentModeBindingsPairs($scope.modes);
      $scope.$on('switchMode', function onSwitchMode() {
        $scope.current_bindings = modesService.currentModeBindingsPairs($scope.modes);
        $scope.deferDigest($scope);
      });
    }
  ]);
