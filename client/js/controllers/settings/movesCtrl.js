'use strict';

angular.module('clickApp.controllers')
  .controller('settingsMovesCtrl', [
    '$scope',
    function($scope) {
      console.log('init settingsMovesCtrl');

      $scope.data_ready
        .then(function() {
          $scope.modes = R.keys($scope.settings.default['Moves']).sort();
          $scope.mode = R.head($scope.modes);
        });
    }
  ]);
