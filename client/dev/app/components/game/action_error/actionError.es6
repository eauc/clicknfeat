(function() {
  angular.module('clickApp.directives')
    .directive('clickGameActionError', gameActionErrorDirectiveFactory);

  gameActionErrorDirectiveFactory.$inject = [];
  function gameActionErrorDirectiveFactory() {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, element) {
      const banner = element[0];
      console.log('gameActionError');

      banner.style.display = 'none';

      const mode_span = banner.querySelector('.action-error-mode-name');
      const reason_span = banner.querySelector('.action-error-reason');

      scope.onStateChangeEvent('Game.action.error', onActionError, scope);

      let timeout;
      function onActionError(event, error) {
        if(R.exists(timeout)) self.clearTimeout(timeout);

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
