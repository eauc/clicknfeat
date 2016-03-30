(function() {
  angular.module('clickApp.directives')
    .directive('clickMailNotification', mailNotificationDirectiveFactory);

  mailNotificationDirectiveFactory.$inject = [
    '$rootScope'
  ];
  function mailNotificationDirectiveFactory($rootScope) {
    return {
      restrict: 'E',
      scope: { type: '@' },
      templateUrl: 'app/components/mail_notification/mail_notification.html',
      link: link
    };

    function link(scope, element) {
      const audio = element[0].querySelector('audio');
      $rootScope.onStateChangeEvent(`${s.capitalize(scope.type)}.chat.receive`,
                                    onChat, scope);

      function onChat() {
        console.log(`${scope.type}MailNotification`);
        audio.currentTime = 0;
        audio.play();
      }
    }
  }
})();
