'use strict';

angular.module('clickApp.directives').directive('clickBadDiceNotification', [function () {
  return {
    restrict: 'E',
    template: ['<audio src="/data/sound/naindows-hahaha02.wav">', '</audio>'].join(''),
    link: function link(scope, element) {
      var audio = element[0].querySelector('audio');
      scope.onStateChangeEvent('Game.dice.roll', function () {
        var ctxt = R.last(R.pathOr([], ['state', 'game', 'dice'], scope));
        if (ctxt.type === 'rollDeviation') return;

        var dice = R.propOr([], 'd', ctxt);
        if (R.length(dice) < 2) return;

        var mean = R.reduce(R.add, 0, dice) / R.length(dice);
        if (mean >= 2) return;

        audio.currentTime = 0;
        audio.play();
      }, scope);
    }
  };
}]);
//# sourceMappingURL=badDiceNotification.js.map
