'use strict';

angular.module('clickApp.controllers')
  .controller('loungeCtrl', [
    '$scope',
    function($scope) {
      console.log('init loungeCtrl');
      $scope.checkUser();
    }
  ]);
