angular.module('clickApp.directives')
  .directive('clickBadDiceNotification', [
    function() {
      return {
        restrict: 'E',
        template: [
          '<audio src="/data/sound/naindows-hahaha02.wav">',
          '</audio>',
        ].join(''),
        link: function(scope, element/*, attrs*/) {
          let audio = element[0].querySelector('audio');
          scope.onGameEvent('diceRoll', (event, ctxt) => {
            if(R.isNil(ctxt)) return;
            let dice = R.propOr([], 'd', ctxt);
            if(R.length(dice) < 2) return;
            let mean = R.reduce(R.add, 0, dice) / R.length(dice);
            console.log('badDiceNotification', mean);
            if(mean >= 2) return;
            
            audio.currentTime = 0;
            audio.play();
          }, scope);
        }
      };
    }
  ]);
