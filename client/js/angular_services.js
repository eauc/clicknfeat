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
    'commands',
    gameServiceFactory
  ])
  .factory('games', [
    'localStorage',
    'game',
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
  ])
  .factory('http', [
    httpServiceFactory
  ])
  .factory('gameBoard', [
    'http',
    gameBoardServiceFactory
  ])
  .factory('commands', [
    commandsServiceFactory
  ])
  .factory('setBoardCommand', [
    'commands',
    setBoardCommandServiceFactory
  ])
  .factory('allCommands', [
    'setBoardCommand',
    function() { return {}; }
  ]);
