angular.module('clickApp.directives')
  .directive('clickUserMailNotification', [
    'pubSub',
    function(pubSubService) {
      return {
        restrict: 'E',
        template: [
          '<audio src="/data/sound/you_got_mail.wav">',
          '</audio>',
        ].join(''),
        link: function(scope, element/*, attrs*/) {
          let audio = element[0].querySelector('audio');
          scope.user_ready.then(() => {
            let unsub = pubSubService.subscribe('chat', (event, chats) => {
              let msg = R.last(chats);
              console.log('userMailNotification', event, chats, msg);
              if(msg.from === scope.user.state.stamp) return;
              
              audio.currentTime = 0;
              audio.play();
            }, scope.user.connection.channel);
            scope.$on('$destroy', () => { unsub(); });
          });
        }
      };
    }
  ])
  .directive('clickGameMailNotification', [
    function() {
      return {
        restrict: 'E',
        template: [
          '<audio src="/data/sound/you_got_mail.wav">',
          '</audio>',
        ].join(''),
        link: function(scope, element/*, attrs*/) {
          let audio = element[0].querySelector('audio');
          scope.onGameEvent('chat', (event) => {
            let msg = R.last(scope.game.chat);
            console.log('gameMailNotification', event, msg);
            if(msg.from === scope.user.state.name) return;
              
            audio.currentTime = 0;
            audio.play();
          }, scope);
        }
      };
    }
  ]);
