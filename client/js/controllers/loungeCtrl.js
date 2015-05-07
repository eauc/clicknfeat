'use strict';

angular.module('clickApp.controllers')
  .controller('loungeCtrl', [
    '$scope',
    'user',
    function($scope,
             userService) {
      console.log('init loungeCtrl');
      $scope.checkUser();
      $scope.user_desc = userService.description($scope.user);
    }
  ]);
