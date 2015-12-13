'use strict';

angular.module('clickApp.services').factory('createTemplateMode', ['modes', 'settings', 'commonMode', 'game', function createTemplateModeServiceFactory(modesService, settingsService, commonModeService, gameService) {
  var createTemplate_actions = Object.create(commonModeService.actions);
  createTemplate_actions.moveMap = function createTemplateMoveMap(scope, coord) {
    scope.create.template.x = coord.x;
    scope.create.template.y = coord.y;
    scope.gameEvent('moveCreateTemplate');
  };
  createTemplate_actions.create = function createTemplateCreate(scope, event) {
    scope.create.template.x = event['click#'].x;
    scope.create.template.y = event['click#'].y;
    scope.create.template.r = R.path(['ui_state', 'flip_map'], scope) ? 180 : 0;
    return gameService.executeCommand('createTemplate', [scope.create.template], scope, scope.game);
  };
  var createTemplate_default_bindings = {
    create: 'clickMap'
  };
  var createTemplate_bindings = R.extend(Object.create(commonModeService.bindings), createTemplate_default_bindings);
  var createTemplate_buttons = [];
  var createTemplate_mode = {
    onEnter: function createTemplateOnEnter(scope) {
      scope.gameEvent('enableCreateTemplate');
      scope.gameEvent('enableMoveMap');
    },
    onLeave: function createTemplateOnLeave(scope) {
      scope.create.template = null;
      scope.gameEvent('disableMoveMap');
      scope.gameEvent('disableCreateTemplate');
    },
    name: 'CreateTemplate',
    actions: createTemplate_actions,
    buttons: createTemplate_buttons,
    bindings: createTemplate_bindings
  };
  modesService.registerMode(createTemplate_mode);
  settingsService.register('Bindings', createTemplate_mode.name, createTemplate_default_bindings, function (bs) {
    R.extend(createTemplate_mode.bindings, bs);
  });
  return createTemplate_mode;
}]);
//# sourceMappingURL=createTemplate.js.map
