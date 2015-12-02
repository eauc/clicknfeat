'use strict';

angular.module('clickApp.filters')
  .filter('game', [
    'game',
    function(gameService) {
      return function(input, method) {
        var args = R.tail(R.tail(arguments));
        if(!R.exists(gameService[method])) {
          console.error('Game Filter: method "'+method+'" does not exist');
          return;
        }
        return gameService[method].apply(null, R.append(input, args));
      };
    }
  ])
  .filter('gameLayers', [
    'gameLayers',
    function(gameLayersService) {
      return function(input, method) {
        var args = R.tail(R.tail(arguments));
        if(!R.exists(gameLayersService[method])) {
          console.error('gameLayers Filter: method "'+method+'" does not exist');
          return;
        }
        return gameLayersService[method].apply(null, R.append(input, args));
      };
    }
  ])
  .filter('gameRuler', [
    'gameRuler',
    function(gameRulerService) {
      return function(input, method) {
        var args = R.tail(R.tail(arguments));
        if(!R.exists(gameRulerService[method])) {
          console.error('gameRuler Filter: method "'+method+'" does not exist');
          return;
        }
        return gameRulerService[method].apply(null, R.append(input, args));
      };
    }
  ])
  .filter('modes', [
    'modes',
    function(modesService) {
      return function(input, method) {
        var args = R.tail(R.tail(arguments));
        if(!R.exists(modesService[method])) {
          console.error('Modes Filter: method "'+method+'" does not exist');
          return;
        }
        return modesService[method].apply(null, R.append(input, args));
      };
    }
  ])
  .filter('user', [
    'user',
    function(userService) {
      return function(input, method) {
        var args = R.tail(R.tail(arguments));
        if(!R.exists(userService[method])) {
          console.error('User Filter: method "'+method+'" does not exist');
          return;
        }
        return userService[method].apply(null, R.append(input, args));
      };
    }
  ])
  .filter('userConnection', [
    'userConnection',
    function(userConnectionService) {
      return function(input, method) {
        var args = R.tail(R.tail(arguments));
        if(!R.exists(userConnectionService[method])) {
          console.error('UserConnection Filter: method "'+method+'" does not exist');
          return;
        }
        return userConnectionService[method].apply(null, R.append(input, args));
      };
    }
  ]);
