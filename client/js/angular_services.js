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
    'gameModels',
    'gameModelSelection',
    'gameLayers',
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
    'gameTemplateSelection',
    commonModeServiceFactory
  ])
  .factory('defaultMode', [
    'modes',
    'settings',
    'commonMode',
    'game',
    'template',
    'gameTemplateSelection',
    'gameModels',
    'gameModelSelection',
    defaultModeServiceFactory
  ])
  .factory('rulerMode', [
    'modes',
    'settings',
    'commonMode',
    'game',
    'gameRuler',
    'model',
    'gameModels',
    'gameModelSelection',
    'prompt',
    rulerModeServiceFactory
  ])
  .factory('createModelMode', [
    'modes',
    'commonMode',
    'game',
    createModelModeServiceFactory
  ])
  .factory('modelsMode', [
    'modes',
    'settings',
    'defaultMode',
    'model',
    'game',
    'gameModels',
    'gameModelSelection',
    'prompt',
    modelsModeServiceFactory
  ])
  .factory('modelBaseMode', [
    'modes',
    'settings',
    'modelsMode',
    'sprayTemplateMode',
    'model',
    'game',
    'gameModels',
    'gameModelSelection',
    modelBaseModeServiceFactory
  ])
  .factory('modelMode', [
    'modes',
    'settings',
    'modelsMode',
    'modelBaseMode',
    'model',
    'game',
    'gameModels',
    'gameModelSelection',
    modelModeServiceFactory
  ])
  .factory('modelChargeMode', [
    'modes',
    'settings',
    'modelsMode',
    'modelBaseMode',
    'model',
    'game',
    'gameModels',
    'gameModelSelection',
    modelChargeModeServiceFactory
  ])
  .factory('modelPlaceMode', [
    'modes',
    'settings',
    'modelsMode',
    'modelBaseMode',
    'game',
    'gameModels',
    'gameModelSelection',
    modelPlaceModeServiceFactory
  ])
  .factory('createTemplateMode', [
    'modes',
    'commonMode',
    'game',
    createTemplateModeServiceFactory
  ])
  .factory('templateMode', [
    'modes',
    'settings',
    'defaultMode',
    'template',
    'game',
    'gameTemplates',
    'gameTemplateSelection',
    templateModeServiceFactory
  ])
  .factory('aoeTemplateMode', [
    'modes',
    'settings',
    'templateMode',
    'game',
    'gameTemplates',
    'gameTemplateSelection',
    'gameRuler',
    'prompt',
    aoeTemplateModeServiceFactory
  ])
  .factory('sprayTemplateMode', [
    'modes',
    'settings',
    'templateMode',
    'sprayTemplate',
    'game',
    'gameTemplates',
    'gameTemplateSelection',
    'gameModels',
    sprayTemplateModeServiceFactory
  ])
  .factory('wallTemplateMode', [
    'modes',
    'settings',
    'templateMode',
    'game',
    'gameTemplateSelection',
    wallTemplateModeServiceFactory
  ])
  .factory('allModes', [
    'defaultMode',
    'rulerMode',
    'createModelMode',
    'modelsMode',
    'modelMode',
    'modelChargeMode',
    'modelPlaceMode',
    'createTemplateMode',
    'templateMode',
    'aoeTemplateMode',
    'sprayTemplateMode',
    'wallTemplateMode',
    function() { return {}; }
  ])
  .factory('http', [
    httpServiceFactory
  ])
  .factory('gameBoard', [
    'http',
    gameBoardServiceFactory
  ])
  .factory('gameFactions', [
    'http',
    gameFactionsServiceFactory
  ])
  .factory('gameMap', [
    'gameModels',
    'gameTemplates',
    gameMapServiceFactory
  ])
  .factory('gameScenario', [
    'http',
    gameScenarioServiceFactory
  ])
  .factory('gameRuler', [
    'point',
    'model',
    'gameModels',
    gameRulerServiceFactory
  ])
  .factory('gameTemplates', [
    'template',
    gameTemplatesServiceFactory
  ])
  .factory('gameTemplateSelection', [
    'modes',
    'gameTemplates',
    gameTemplateSelectionServiceFactory
  ])
  .factory('gameModels', [
    'model',
    gameModelsServiceFactory
  ])
  .factory('gameModelSelection', [
    'modes',
    'gameModels',
    'model',
    gameModelSelectionServiceFactory
  ])
  .factory('gameLayers', [
    gameLayersServiceFactory
  ])
  .factory('commands', [
    commandsServiceFactory
  ])
  .factory('createModelCommand', [
    'commands',
    'model',
    'gameModels',
    'gameModelSelection',
    createModelCommandServiceFactory
  ])
  .factory('deleteModelCommand', [
    'commands',
    'model',
    'gameModels',
    'gameModelSelection',
    deleteModelCommandServiceFactory
  ])
  .factory('setModelSelectionCommand', [
    'commands',
    'gameModelSelection',
    setModelSelectionCommandServiceFactory
  ])
  .factory('onModelsCommand', [
    'commands',
    'model',
    'gameModels',
    'gameModelSelection',
    onModelsCommandServiceFactory
  ])
  .factory('lockModelsCommand', [
    'commands',
    'gameModels',
    lockModelsCommandServiceFactory
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
  .factory('rollDeviationCommand', [
    'commands',
    rollDeviationCommandServiceFactory
  ])
  .factory('setBoardCommand', [
    'commands',
    setBoardCommandServiceFactory
  ])
  .factory('setLayersCommand', [
    'commands',
    'gameLayers',
    setLayersCommandServiceFactory
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
    'createModelCommand',
    'deleteModelCommand',
    'setModelSelectionCommand',
    'onModelsCommand',
    'lockModelsCommand',
    'createTemplateCommand',
    'deleteTemplatesCommand',
    'lockTemplatesCommand',
    'onTemplatesCommand',
    'rollDiceCommand',
    'rollDeviationCommand',
    'setBoardCommand',
    'setLayersCommand',
    'setRulerCommand',
    'setScenarioCommand',
    function() { return {}; }
  ])
  .factory('model', [
    'settings',
    'point',
    'gameFactions',
    modelServiceFactory
  ])
  .factory('template', [
    'settings',
    'point',
    templateServiceFactory
  ])
  .factory('aoeTemplate', [
    'template',
    'model',
    'point',
    aoeTemplateServiceFactory
  ])
  .factory('sprayTemplate', [
    'template',
    'model',
    'point',
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
