'use strict';

angular.module('clickApp.directives')
  .directive('clickGameWarnMode', [
    '$window',
    '$timeout',
    function($window,
             $timeout) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          console.log('gameWarnMode');
          element[0].style.display = 'none';

          var timeout;
          scope.onGameEvent('modeUnknownAction', function onModeUnknownAction() {
            if(R.exists(timeout)) $timeout.cancel(timeout);
            
            element[0].innerHTML = scope.currentModeName();
            element[0].style.display = 'initial';
            timeout = $timeout(function hideWarnMode() {
              element[0].style.display = 'none';
              timeout = null;
            }, 500);
          }, scope);
        }
      };
    }
  ]);
