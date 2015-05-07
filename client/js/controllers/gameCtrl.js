'use strict';

angular.module('clickApp.controllers')
  .controller('gameCtrl', [
    '$scope',
    '$stateParams',
    function($scope,
             $stateParams) {
      console.log('init gameCtrl', $stateParams);
    }
  ]);
