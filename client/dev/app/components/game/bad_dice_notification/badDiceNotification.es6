(function() {
  angular.module('clickApp.directives')
    .directive('clickBadDiceNotification', badDiceNotificationDirectiveFactory);

  badDiceNotificationDirectiveFactory.$inject = [];
  function badDiceNotificationDirectiveFactory() {
    return {
      restrict: 'E',
      templateUrl: 'app/components/game/bad_dice_notification/bad_dice_notification.html',
      link: link
    };

    function link(scope, element) {
      const audio = element[0].querySelector('audio');
      scope.onStateChangeEvent('Game.dice.roll', onDiceRoll, scope);

      function onDiceRoll() {
        const ctxt = R.last(R.pathOr([], ['state','game','dice'], scope));
        if(ctxt.type === 'rollDeviation') return;

        const dice = R.propOr([], 'd', ctxt);
        if(R.length(dice) < 2) return;

        const mean = R.reduce(R.add, 0, dice) / R.length(dice);
        if(mean >= 2) return;

        audio.currentTime = 0;
        audio.play();
      }
    }
  }
})();
