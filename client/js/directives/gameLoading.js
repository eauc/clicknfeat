'use strict';

angular.module('clickApp.directives')
  .directive('clickGameLoading', [
    '$window',
    function($window) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          console.log('gameLoading');
          scope.onGameEvent('gameLoading', function() {
            element[0].style.display = 'block';
          }, scope);
          scope.onGameEvent('gameLoaded', function() {
            element[0].style.display = 'none';
          }, scope);
        }
      };
    }
  ]);
