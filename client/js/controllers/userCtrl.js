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

      $scope.user_ready.then(function() {
        console.log('copy user for edition', $scope.user);
        $scope.edit_user = R.clone($scope.user);
      });

      $scope.doSaveUser = function doSaveUser() {
        $scope.setUser($scope.edit_user)
          .then(function() {
            $state.go('lounge');
          });
      };
    }
  ]);
