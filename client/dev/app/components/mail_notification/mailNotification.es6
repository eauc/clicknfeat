(function() {
  angular.module('clickApp.directives')
    .directive('clickMailNotification', mailNotificationDirectiveFactory);

  mailNotificationDirectiveFactory.$inject = [
    '$rootScope',
    'appGame',
    'appUser',
  ];
  function mailNotificationDirectiveFactory($rootScope,
                                            appGameService,
                                            appUserService) {
    const services = {
      game: appGameService,
      user: appUserService
    };
    return {
      restrict: 'E',
      scope: { type: '@' },
      templateUrl: 'app/components/mail_notification/mail_notification.html',
      link: link
    };

    function link(scope, element) {
      const audio = element[0].querySelector('audio');
      $rootScope.listenSignal(onChat, services[scope.type].chat.new_chat, scope);

      function onChat() {
        console.info(`${scope.type}MailNotification`);
        audio.currentTime = 0;
        audio.play();
      }
    }
  }
})();
