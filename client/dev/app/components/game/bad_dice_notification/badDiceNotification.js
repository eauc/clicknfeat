'use strict';

(function () {
  angular.module('clickApp.directives').directive('clickBadDiceNotification', badDiceNotificationDirectiveFactory);

  badDiceNotificationDirectiveFactory.$inject = ['appGame'];
  function badDiceNotificationDirectiveFactory(appGameService) {
    return {
      restrict: 'E',
      templateUrl: 'app/components/game/bad_dice_notification/bad_dice_notification.html',
      link: link
    };

    function link(scope, element) {
      var audio = element[0].querySelector('audio');
      scope.listenSignal(onBadDiceRoll, appGameService.bad_dice, scope);

      function onBadDiceRoll() {
        audio.currentTime = 0;
        audio.play();
      }
    }
  }
})();
//# sourceMappingURL=badDiceNotification.js.map
