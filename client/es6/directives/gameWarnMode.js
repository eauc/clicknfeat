'use strict';

angular.module('clickApp.directives')
  .directive('clickGameWarnMode', [
    '$window',
    '$timeout',
    function($window,
             $timeout) {
      return {
        restrict: 'A',
        link: function(scope, element/*, attrs*/) {
          console.log('gameWarnMode');
          element[0].style.display = 'none';
          var mode_span = element[0].querySelector('.warn-mode-name');
          var reason_span = element[0].querySelector('.warn-reason');

          var timeout;
          scope.onGameEvent('modeActionError', function onModeActionError(event, reason) {
            if(R.exists(timeout)) $timeout.cancel(timeout);
            
            mode_span.innerHTML = scope.currentModeName();
            reason_span.innerHTML = reason;

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
