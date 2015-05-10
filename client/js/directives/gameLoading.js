'use strict';

angular.module('clickApp.directives')
  .directive('clickGameLoading', [
    '$window',
    function($window) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          console.log('gameLoading');
          scope.$on('gameLoading', function() {
            console.log('on gameLoading');
            element[0].style.display = 'block';
          });
          scope.$on('gameLoaded', function() {
            console.log('on gameLoaded');
            element[0].style.display = 'none';
          });
        }
      };
    }
  ]);
