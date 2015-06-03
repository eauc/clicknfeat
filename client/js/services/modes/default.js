'use strict';

self.defaultModeServiceFactory = function defaultModeServiceFactory(modesService,
                                                                    commonModeService,
                                                                    gameService,
                                                                    templateService,
                                                                    gameTemplateSelectionService) {
  var default_actions = Object.create(commonModeService.actions);
  default_actions.clickTemplate = function defaultClickTemplate(scope, event) {
    scope.game.template_selection =
      gameTemplateSelectionService.set('local', event.target.state.stamp,
                                       scope, scope.game.template_selection);
  };
  default_actions.rightClickTemplate = function defaultRightClickTemplate(scope, event) {
    scope.gameEvent('openSelectionDetail', 'template', event.target);
    scope.game.template_selection =
      gameTemplateSelectionService.set('local', event.target.state.stamp,
                                       scope, scope.game.template_selection);
  };

  default_actions.dragStartTemplate = function templateDragStartTemplate(scope, event) {
    scope.game.template_selection =
      gameTemplateSelectionService.set('local', event.target.state.stamp,
                                       scope, scope.game.template_selection);
    modesService.currentModeAction('dragStartTemplate', scope, event, null, scope.modes);
  };

  var default_bindings = Object.create(commonModeService.bindings);
  var default_buttons = [
    [ 'Flip Map', 'flipMap' ],
  ];
  var default_mode = {
    name: 'Default',
    actions: default_actions,
    buttons: default_buttons,
    bindings: default_bindings,
  };
  modesService.registerMode(default_mode);
  return default_mode;
};
