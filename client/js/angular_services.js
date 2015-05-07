angular.module('clickApp.services')
  .factory('localStorage', [
    function() {
      return self.localStorage;
    }
  ])
  .factory('user', [
    'localStorage',
    userServiceFactory
  ])
  .factory('game', [
    gameServiceFactory
  ])
  .factory('games', [
    'localStorage',
    gamesServiceFactory
  ]);
