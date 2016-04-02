(function() {
  angular.module('clickApp.directives')
    .directive('clickGameError', gameErrorDirectiveFactory);

  gameErrorDirectiveFactory.$inject = [];
  function gameErrorDirectiveFactory() {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, element) {
      const banner = element[0];
      console.log('gameError');

      banner.style.display = 'none';

      const mode_span = banner.querySelector('.game-error-mode-name');
      const reason_span = banner.querySelector('.game-error-reason');

      scope.onStateChangeEvent('Game.error', onError, scope);

      let timeout;
      function onError(_event_, error) {
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
