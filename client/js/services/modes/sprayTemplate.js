'use strict';

self.sprayTemplateModeServiceFactory = function sprayTemplateModeServiceFactory(modesService,
                                                                                settingsService,
                                                                                templateModeService,
                                                                                gameService,
                                                                                gameTemplateSelectionService) {
  var template_actions = Object.create(templateModeService.actions);
  template_actions.spraySize6 = function spraySize6(scope) {
    var target = gameTemplateSelectionService.get('local', scope.game.template_selection);
    gameService.executeCommand('onTemplates', 'setSize', 6, [target], scope, scope.game);
  };
  template_actions.spraySize8 = function spraySize8(scope) {
    var target = gameTemplateSelectionService.get('local', scope.game.template_selection);
    gameService.executeCommand('onTemplates', 'setSize', 8, [target], scope, scope.game);
  };
  template_actions.spraySize10 = function spraySize10(scope) {
    var target = gameTemplateSelectionService.get('local', scope.game.template_selection);
    gameService.executeCommand('onTemplates', 'setSize', 10, [target], scope, scope.game);
  };
  var template_default_bindings = {
    spraySize6: '6',
    spraySize8: '8',
    spraySize10: '0',
  };
  var template_bindings = R.extend(Object.create(templateModeService.bindings),
                                   template_default_bindings);
  var template_buttons = R.concat([
    [ 'Size', 'toggle', 'size' ],
    [ 'Spray6', 'spraySize6', 'size' ],
    [ 'Spray8', 'spraySize8', 'size' ],
    [ 'Spray10', 'spraySize10', 'size' ],
  ], templateModeService.buttons);
  var template_mode = {
    onEnter: function templateOnEnter(scope) {
    },
    onLeave: function templateOnLeave(scope) {
    },
    name: 'spray'+templateModeService.name,
    actions: template_actions,
    buttons: template_buttons,
    bindings: template_bindings,
  };
  modesService.registerMode(template_mode);
  settingsService.register('Bindings',
                           template_mode.name,
                           template_default_bindings,
                           function(bs) {
                             R.extend(template_mode.bindings, bs);
                           });
  return template_mode;
};
