angular.module('clickApp.services')
  .factory('localStorage', [
    function() {
      return self.localStorage;
    }
  ])
  .factory('pubSub', [
    pubSubServiceFactory
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
    'gameRuler',
    'gameTemplates',
    'gameTemplateSelection',
    gameServiceFactory
  ])
  .factory('games', [
    'localStorage',
    'jsonParser',
    'jsonStringifier',
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
    'settings',
    'commonMode',
    'game',
    'template',
    'gameTemplateSelection',
    defaultModeServiceFactory
  ])
  .factory('rulerMode', [
    'modes',
    'settings',
    'commonMode',
    'game',
    'gameRuler',
    'prompt',
    rulerModeServiceFactory
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
    'rulerMode',
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
  .factory('gameRuler', [
    'point',
    gameRulerServiceFactory
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
    'gameTemplateSelection',
    lockTemplatesCommandServiceFactory
  ])
  .factory('onTemplatesCommand', [
    'commands',
    'template',
    'gameTemplates',
    'gameTemplateSelection',
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
  .factory('setRulerCommand', [
    'commands',
    'gameRuler',
    setRulerCommandServiceFactory
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
    'setRulerCommand',
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
  .factory('sprayTemplate', [
    'template',
    sprayTemplateServiceFactory
  ])
  .factory('wallTemplate', [
    'template',
    wallTemplateServiceFactory
  ])
  .factory('allTemplates', [
    'aoeTemplate',
    'sprayTemplate',
    'wallTemplate',
    function() { return {}; }
  ]);
