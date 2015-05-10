'use strict';

angular.module('clickApp.directives')
  .directive('clickLogReplayList', [
    '$window',
    function($window) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          console.log('logReplayList');
          scope.$on('logReplayList', function onLogReplayList() {
            console.log('on logReplayList');
            $window.requestAnimationFrame(function _onLogReplayList() {
              element[0].scrollTop = 1000000;
            });
          });
        }
      };
    }
  ]);
