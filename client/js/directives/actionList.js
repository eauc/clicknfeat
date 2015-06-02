'use strict';

angular.module('clickApp.directives')
  .directive('clickActionList', [
    '$window',
    function($window) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          scope.digestOnGameEvent('switchMode', scope);
        }
      };
    }
  ]);
