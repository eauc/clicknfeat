'use strict';

self.defaultModeServiceFactory = function defaultModeServiceFactory(modesService,
                                                                    settingsService,
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
  default_actions.dragStartTemplate = function defaultDragStartTemplate(scope, event) {
    scope.game.template_selection =
      gameTemplateSelectionService.set('local', event.target.state.stamp,
                                       scope, scope.game.template_selection);
    modesService.currentModeAction('dragStartTemplate', scope, event, null, scope.modes);
  };
  default_actions.enterRulerMode = function defaultEnterRulerMode(scope, event) {
    modesService.switchToMode('Ruler', scope, scope.modes);
  };

  var default_default_bindings = {
    enterRulerMode: 'r',
  };
  var default_bindings = R.extend(Object.create(commonModeService.bindings),
                                  default_default_bindings);
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
  settingsService.register('Bindings',
                           default_mode.name,
                           default_default_bindings,
                           function(bs) {
                             R.extend(default_mode.bindings, bs);
                           });
  return default_mode;
};
