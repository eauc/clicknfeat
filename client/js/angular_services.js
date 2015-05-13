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
    'gameTemplates',
    'gameTemplateSelection',
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
  .factory('createTemplateMode', [
    'modes',
    'commonMode',
    'game',
    createTemplateModeServiceFactory
  ])
  .factory('allModes', [
    'defaultMode',
    'createTemplateMode',
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
  .factory('gameTemplates', [
    gameTemplatesServiceFactory
  ])
  .factory('commands', [
    commandsServiceFactory
  ])
  .factory('createTemplateCommand', [
    'commands',
    'template',
    'gameTemplates',
    'gameTemplateSelection',
    createTemplateCommandServiceFactory
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
    'createTemplateCommand',
    'rollDiceCommand',
    'setBoardCommand',
    'setScenarioCommand',
    function() { return {}; }
  ])
  .factory('template', [
    templateServiceFactory
  ])
  .factory('aoeTemplate', [
    'template',
    aoeTemplateServiceFactory
  ])
  .factory('allTemplates', [
    'aoeTemplate',
    function() { return {}; }
  ]);
