'use strict';

angular.module('clickApp.directives').directive('clickUserMailNotification', ['pubSub', function (pubSubService) {
  return {
    restrict: 'E',
    template: ['<audio src="/data/sound/you_got_mail.wav">', '</audio>'].join(''),
    link: function link(scope, element /*, attrs*/) {
      var audio = element[0].querySelector('audio');
      scope.user_ready.then(function () {
        var unsub = pubSubService.subscribe('chat', function (event, chats) {
          var msg = R.last(chats);
          console.log('userMailNotification', event, chats, msg);
          if (msg.from === scope.user.state.stamp) return;

          audio.currentTime = 0;
          audio.play();
        }, scope.user.connection.channel);
        scope.$on('$destroy', function () {
          unsub();
        });
      });
    }
  };
}]).directive('clickGameMailNotification', [function () {
  return {
    restrict: 'E',
    template: ['<audio src="/data/sound/you_got_mail.wav">', '</audio>'].join(''),
    link: function link(scope, element /*, attrs*/) {
      var audio = element[0].querySelector('audio');
      scope.onGameEvent('chat', function (event) {
        var msg = R.last(scope.game.chat);
        console.log('gameMailNotification', event, msg);
        if (msg.from === scope.user.state.name) return;

        audio.currentTime = 0;
        audio.play();
      }, scope);
    }
  };
}]);
//# sourceMappingURL=mailNotification.js.map
