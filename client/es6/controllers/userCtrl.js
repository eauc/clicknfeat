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
        $scope.edit_user = R.clone($scope.user.state);
        $scope.$digest();
      });

      $scope.doSaveUser = function doSaveUser() {
        $scope.user.state = $scope.edit_user;
        return R.pipeP(
          userService.checkOnline,
          $scope.setUser,
          function() {
            $state.go('lounge');
          }
        )($scope.user);
      };
    }
  ]);
