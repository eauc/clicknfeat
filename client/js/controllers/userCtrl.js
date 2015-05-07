'use strict';

angular.module('clickApp.controllers')
  .controller('userCtrl', [
    '$scope',
    '$state',
    'user',
    function($scope,
             $state,
             userService) {
      console.log('init userCtrl');
      $scope.edit_user = R.clone($scope.user);
      $scope.doPlayOffline = function doPlayOffline() {
        $scope.setUser($scope.edit_user);
        $state.go('lounge');
      };
    }
  ]);
