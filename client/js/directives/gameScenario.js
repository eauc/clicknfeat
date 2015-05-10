'use strict';

angular.module('clickApp.directives')
  .directive('clickGameScenario', [
    '$window',
    function($window) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          scope.digestOnGameEvent(scope, 'changeScenario');
        }
      };
    }
  ]);
