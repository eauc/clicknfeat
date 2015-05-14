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
    'game',
    'template',
    'gameTemplateSelection',
    defaultModeServiceFactory
  ])
  .factory('createTemplateMode', [
    'modes',
    'commonMode',
    'game',
    createTemplateModeServiceFactory
  ])
  .factory('templateLockedMode', [
    'modes',
    'defaultMode',
    'game',
    'gameTemplateSelection',
    templateLockedModeServiceFactory
  ])
  .factory('templateMode', [
    'modes',
    'templateLockedMode',
    'template',
    'game',
    'gameTemplateSelection',
    templateModeServiceFactory
  ])
  .factory('allModes', [
    'defaultMode',
    'createTemplateMode',
    'templateLockedMode',
    'templateMode',
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
  .factory('gameTemplateSelection', [
    'modes',
    'gameTemplates',
    gameTemplateSelectionServiceFactory
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
  .factory('deleteTemplatesCommand', [
    'commands',
    'template',
    'gameTemplates',
    'gameTemplateSelection',
    deleteTemplatesCommandServiceFactory
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
    'deleteTemplatesCommand',
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
