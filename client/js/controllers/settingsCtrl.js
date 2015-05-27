'use strict';

angular.module('clickApp.controllers')
  .controller('settingsCtrl', [
    '$scope',
    '$state',
    'settings',
    function($scope,
             $state,
             settingsService) {
      console.log('init settingsCtrl');
      if($state.current.name === 'settings') {
        $scope.goToState('.Bindings');
      }
      console.log($scope.settings);
      $scope.menu = R.keys($scope.settings.default);
      $scope.doUpdateSettings = function doUpdateSettings() {
        settingsService.update($scope.settings);
      };
    }
  ]);
