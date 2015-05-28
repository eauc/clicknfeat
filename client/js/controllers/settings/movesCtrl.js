'use strict';

angular.module('clickApp.controllers')
  .controller('settingsMovesCtrl', [
    '$scope',
    function($scope) {
      console.log('init settingsMovesCtrl');
      $scope.modes = R.keys($scope.settings.default['Moves']);
      $scope.mode = R.head($scope.modes);
    }
  ]);
