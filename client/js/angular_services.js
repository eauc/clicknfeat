angular.module('clickApp.services')
  .factory('localStorage', [
    function() {
      return self.localStorage;
    }
  ])
  .factory('jsonStringifier', [
    jsonStringifierServiceFactory
  ])
  .factory('jsonParser', [
    jsonParserServiceFactory
  ])
  .factory('fileExport', [
    'jsonStringifier',
    fileExportServiceFactory
  ])
  .factory('fileImport', [
    'jsonParser',
    fileImportServiceFactory
  ])
  .factory('user', [
    'localStorage',
    userServiceFactory
  ])
  .factory('game', [
    'jsonStringifier',
    'commands',
    'gameTemplates',
    'gameTemplateSelection',
    gameServiceFactory
  ])
  .factory('games', [
    'localStorage',
    'jsonParser',
    'game',
    gamesServiceFactory
  ])
  .factory('settings', [
    'localStorage',
    'jsonParser',
    'jsonStringifier',
    settingsServiceFactory
  ])
  .factory('point', [
    pointServiceFactory
  ])
  .factory('modes', [
    modesServiceFactory
  ])
  .factory('commonMode', [
    'modes',
    'settings',
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
    'settings',
    'defaultMode',
    'game',
    'gameTemplateSelection',
    templateLockedModeServiceFactory
  ])
  .factory('templateMode', [
    'modes',
    'settings',
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
  .factory('lockTemplatesCommand', [
    'commands',
    'gameTemplates',
    lockTemplatesCommandServiceFactory
  ])
  .factory('onTemplatesCommand', [
    'commands',
    'template',
    'gameTemplates',
    onTemplatesCommandServiceFactory
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
    'lockTemplatesCommand',
    'onTemplatesCommand',
    'rollDiceCommand',
    'setBoardCommand',
    'setScenarioCommand',
    function() { return {}; }
  ])
  .factory('template', [
    'settings',
    'point',
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
