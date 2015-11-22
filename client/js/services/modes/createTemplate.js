'use strict';

angular.module('clickApp.services')
  .factory('createTemplateMode', [
    'modes',
    'commonMode',
    'game',
    function createTemplateModeServiceFactory(modesService,
                                              commonModeService,
                                              gameService) {
      var createTemplate_actions = Object.create(commonModeService.actions);
      createTemplate_actions.moveMap = function createTemplateMoveMap(scope, coord) {
        scope.create.template.x = coord.x;
        scope.create.template.y = coord.y;
        scope.gameEvent('moveCreateTemplate');
      };
      createTemplate_actions.clickMap = function createTemplateMoveMap(scope, coord) {
        scope.create.template.x = coord.x;
        scope.create.template.y = coord.y;
        scope.create.template.r = R.path(['ui_state','flip_map'], scope) ? 180 : 0;
        return gameService.executeCommand('createTemplate', [scope.create.template],
                                          scope, scope.game);
      };
      var createTemplate_bindings = Object.create(commonModeService.bindings);
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
        bindings: createTemplate_bindings,
      };
      modesService.registerMode(createTemplate_mode);
      return createTemplate_mode;
    }
  ]);
