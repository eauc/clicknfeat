'use strict';

angular.module('clickApp.filters')
  .filter('game', [
    'game',
    function(gameService) {
      return function(input, method) {
        var args = R.tail(R.tail(arguments));
        return gameService[method].apply(null, R.append(input, args));
      };
    }
  ])
  .filter('modes', [
    'modes',
    function(modesService) {
      return function(input, method) {
        var args = R.tail(R.tail(arguments));
        return modesService[method].apply(null, R.append(input, args));
      };
    }
  ]);
