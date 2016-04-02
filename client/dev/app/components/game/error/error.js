'use strict';

(function () {
  angular.module('clickApp.directives').directive('clickGameError', gameErrorDirectiveFactory);

  gameErrorDirectiveFactory.$inject = [];
  function gameErrorDirectiveFactory() {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, element) {
      var banner = element[0];
      console.log('gameError');

      banner.style.display = 'none';

      var mode_span = banner.querySelector('.game-error-mode-name');
      var reason_span = banner.querySelector('.game-error-reason');

      scope.onStateChangeEvent('Game.error', onError, scope);

      var timeout = undefined;
      function onError(_event_, error) {
        if (R.exists(timeout)) self.clearTimeout(timeout);

        mode_span.innerHTML = scope.game.currentModeName();
        reason_span.innerHTML = error;

        banner.style.display = 'initial';
        timeout = self.setTimeout(onTimeout, 1000);
      }
      function onTimeout() {
        banner.style.display = 'none';
        timeout = null;
      }
    }
  }
})();
//# sourceMappingURL=error.js.map
