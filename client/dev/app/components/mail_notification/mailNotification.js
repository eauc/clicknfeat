'use strict';

(function () {
  angular.module('clickApp.directives').directive('clickMailNotification', mailNotificationDirectiveFactory);

  mailNotificationDirectiveFactory.$inject = ['appUser'];
  function mailNotificationDirectiveFactory(appUserService) {
    return {
      restrict: 'E',
      scope: { type: '@' },
      templateUrl: 'app/components/mail_notification/mail_notification.html',
      link: link
    };

    function link(scope, element) {
      var audio = element[0].querySelector('audio');
      appUserService.new_chat.listen(onChat);

      function onChat() {
        console.info(scope.type + 'MailNotification');
        audio.currentTime = 0;
        audio.play();
      }
    }
  }
})();
//# sourceMappingURL=mailNotification.js.map
