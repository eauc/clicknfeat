'use strict';

angular.module('clickApp.directives').directive('clickUserMailNotification', [function () {
  return {
    restrict: 'E',
    template: ['<audio src="/data/sound/you_got_mail.wav">', '</audio>'].join(''),
    link: function link(scope, element) {
      var audio = element[0].querySelector('audio');
      scope.onStateChangeEvent('User.chat', function (event, chat) {
        console.log('userMailNotification', event, chat);
        if (chat.from === scope.state.user.state.stamp) return;

        audio.currentTime = 0;
        audio.play();
      }, scope);
    }
  };
}]).directive('clickGameMailNotification', [function () {
  return {
    restrict: 'E',
    template: ['<audio src="/data/sound/you_got_mail.wav">', '</audio>'].join(''),
    link: function link(scope, element) {
      var audio = element[0].querySelector('audio');
      scope.onStateChangeEvent('Game.chat', function (event, chat) {
        console.log('gameMailNotification', event, chat);
        if (chat.from === scope.state.user.state.name) return;

        audio.currentTime = 0;
        audio.play();
      }, scope);
    }
  };
}]);
//# sourceMappingURL=mailNotification.js.map
