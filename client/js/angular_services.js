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
  ])
  .factory('modes', [
    modesServiceFactory
  ])
  .factory('commonMode', [
    'modes',
    commonModeServiceFactory
  ])
  .factory('defaultMode', [
    'modes',
    'commonMode',
    defaultModeServiceFactory
  ])
  .factory('allModes', [
    'defaultMode',
    function() { return {}; }
  ]);
