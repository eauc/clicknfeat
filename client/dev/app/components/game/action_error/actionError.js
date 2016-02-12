'use strict';

(function () {
  angular.module('clickApp.directives').directive('clickGameActionError', gameActionErrorDirectiveFactory);

  gameActionErrorDirectiveFactory.$inject = [];
  function gameActionErrorDirectiveFactory() {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, element) {
      var banner = element[0];
      console.log('gameActionError');

      banner.style.display = 'none';

      var mode_span = banner.querySelector('.action-error-mode-name');
      var reason_span = banner.querySelector('.action-error-reason');

      scope.onStateChangeEvent('Game.action.error', onActionError, scope);

      var timeout = undefined;
      function onActionError(event, error) {
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
//# sourceMappingURL=actionError.js.map