'use strict';

angular.module('clickApp.filters')
  .filter('capitalize', [
    function() {
      return function(input) {
        return s.capitalize(input);
      };
    }
  ])
  .filter('game', [
    'game',
    function(gameService) {
      return function(input, method, ...args) {
        if(!R.exists(gameService[method])) {
          console.error('Game Filter: method "'+method+'" does not exist');
          return null;
        }
        return gameService[method].apply(null, R.append(input, args));
      };
    }
  ])
  .filter('gameConnection', [
    'gameConnection',
    function(gameConnectionService) {
      return function(input, method, ...args) {
        if(!R.exists(gameConnectionService[method])) {
          console.error('gameConnection Filter: method "'+method+'" does not exist');
          return null;
        }
        return gameConnectionService[method].apply(null, R.append(input, args));
      };
    }
  ])
  .filter('gameLayers', [
    'gameLayers',
    function(gameLayersService) {
      return function(input, method, ...args) {
        if(!R.exists(gameLayersService[method])) {
          console.error('gameLayers Filter: method "'+method+'" does not exist');
          return null;
        }
        return gameLayersService[method].apply(null, R.append(input, args));
      };
    }
  ])
  .filter('gameRuler', [
    'gameRuler',
    function(gameRulerService) {
      return function(input, method, ...args) {
        if(!R.exists(gameRulerService[method])) {
          console.error('gameRuler Filter: method "'+method+'" does not exist');
          return null;
        }
        return gameRulerService[method].apply(null, R.append(input, args));
      };
    }
  ])
  .filter('gameLos', [
    'gameLos',
    function(gameLosService) {
      return function(input, method, ...args) {
        if(!R.exists(gameLosService[method])) {
          console.error('gameLos Filter: method "'+method+'" does not exist');
          return null;
        }
        return gameLosService[method].apply(null, R.append(input, args));
      };
    }
  ])
  .filter('modes', [
    'modes',
    function(modesService) {
      return function(input, method, ...args) {
        if(!R.exists(modesService[method])) {
          console.error('Modes Filter: method "'+method+'" does not exist');
          return null;
        }
        return modesService[method].apply(null, R.append(input, args));
      };
    }
  ])
  .filter('user', [
    'user',
    function(userService) {
      return function(input, method, ...args) {
        if(!R.exists(userService[method])) {
          console.error('User Filter: method "'+method+'" does not exist');
          return null;
        }
        return userService[method].apply(null, R.append(input, args));
      };
    }
  ])
  .filter('userConnection', [
    'userConnection',
    function(userConnectionService) {
      return function(input, method, ...args) {
        if(!R.exists(userConnectionService[method])) {
          console.error('UserConnection Filter: method "'+method+'" does not exist');
          return null;
        }
        return userConnectionService[method].apply(null, R.append(input, args));
      };
    }
  ]);
