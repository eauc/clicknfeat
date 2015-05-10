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
    'game',
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
  .factory('gameScenario', [
    'http',
    gameScenarioServiceFactory
  ])
  .factory('commands', [
    commandsServiceFactory
  ])
  .factory('rollDiceCommand', [
    'commands',
    rollDiceCommandServiceFactory
  ])
  .factory('setBoardCommand', [
    'commands',
    setBoardCommandServiceFactory
  ])
  .factory('setScenarioCommand', [
    'commands',
    setScenarioCommandServiceFactory
  ])
  .factory('allCommands', [
    'rollDiceCommand',
    'setBoardCommand',
    'setScenarioCommand',
    function() { return {}; }
  ]);
