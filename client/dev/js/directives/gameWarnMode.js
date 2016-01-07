'use strict';

angular.module('clickApp.directives').directive('clickGameWarnMode', ['$timeout', function ($timeout) {
  return {
    restrict: 'A',
    link: function link(scope, element) {
      console.log('gameWarnMode');
      element[0].style.display = 'none';

      var mode_span = element[0].querySelector('.warn-mode-name');
      var reason_span = element[0].querySelector('.warn-reason');

      var timeout;
      scope.onStateChangeEvent('Game.action.error', function (event, reason) {
        if (R.exists(timeout)) $timeout.cancel(timeout);

        mode_span.innerHTML = scope.currentModeName();
        reason_span.innerHTML = reason;

        element[0].style.display = 'initial';
        timeout = $timeout(function () {
          element[0].style.display = 'none';
          timeout = null;
        }, 1000);
      }, scope);
    }
  };
}]);
//# sourceMappingURL=gameWarnMode.js.map
