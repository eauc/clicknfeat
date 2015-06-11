'use strict';

self.templateLockedModeServiceFactory = function templateLockedModeServiceFactory(modesService,
                                                                                  settingsService,
                                                                                  defaultModeService,
                                                                                  gameService,
                                                                                  gameTemplatesService,
                                                                                  gameTemplateSelectionService) {
  var template_actions = Object.create(defaultModeService.actions);
  template_actions.clickMap = function templateClickMap(scope, event) {
    scope.game.template_selection =
      gameTemplateSelectionService.clear('local', scope, scope.game.template_selection);
  };
  template_actions.rightClickMap = function templateRightClickMap(scope, event) {
    scope.game.template_selection =
      gameTemplateSelectionService.clear('local', scope, scope.game.template_selection);
  };
  template_actions.unlock = function templateUnlock(scope) {
    var stamp = gameTemplateSelectionService.get('local', scope.game.template_selection);
    gameService.executeCommand('lockTemplates', [stamp], false, scope, scope.game);
    modesService.switchToMode(gameTemplatesService.modeForStamp(stamp, scope.game.templates),
                              scope, scope.modes);
  };
  var template_default_bindings = {
    unlock: 'l',
  };
  var template_bindings = R.extend(Object.create(defaultModeService.bindings),
                                   template_default_bindings);
  var template_buttons = [
    [ 'Unlock', 'unlock' ],
  ];
  var template_mode = {
    onEnter: function templateOnEnter(scope) {
    },
    onLeave: function templateOnLeave(scope) {
    },
    name: 'TemplateLocked',
    actions: template_actions,
    buttons: template_buttons,
    bindings: template_bindings,
  };
  // modesService.registerMode(template_mode);
  settingsService.register('Bindings',
                           template_mode.name,
                           template_default_bindings,
                           function(bs) {
                             R.extend(template_mode.bindings, bs);
                           });
  return template_mode;
};
