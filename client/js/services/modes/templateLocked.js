'use strict';

self.templateLockedModeServiceFactory = function templateLockedModeServiceFactory(modesService,
                                                                                  settingsService,
                                                                                  defaultModeService,
                                                                                  gameService,
                                                                                  gameTemplateSelectionService) {
  var template_actions = Object.create(defaultModeService.actions);
  template_actions.clickMap = function templateClickMap(scope, event) {
    gameTemplateSelectionService.clearLocal(scope, scope.game.template_selection);
  };
  template_actions.rightClickMap = function templateClickMap(scope, event) {
    gameTemplateSelectionService.clearLocal(scope, scope.game.template_selection);
  };
  template_actions.dragMap = function templateDragMap(scope, event) {
    gameTemplateSelectionService.clearLocal(scope, scope.game.template_selection);
  };
  template_actions.aoeSize3 = function templateClickMap(scope) {
    var target = gameTemplateSelectionService.getLocal(scope.game.template_selection);
    gameService.executeCommand('onTemplates', 'setSize', 3, [target], scope, scope.game);
  };
  template_actions.aoeSize4 = function templateClickMap(scope) {
    var target = gameTemplateSelectionService.getLocal(scope.game.template_selection);
    gameService.executeCommand('onTemplates', 'setSize', 4, [target], scope, scope.game);
  };
  template_actions.aoeSize5 = function templateClickMap(scope) {
    var target = gameTemplateSelectionService.getLocal(scope.game.template_selection);
    gameService.executeCommand('onTemplates', 'setSize', 5, [target], scope, scope.game);
  };
  template_actions.lock = function templateLock(scope) {
    var target = gameTemplateSelectionService.getLocal(scope.game.template_selection);
    gameService.executeCommand('lockTemplates', [target], false, scope, scope.game);
    modesService.switchToMode('Template', scope, scope.modes);
  };
  var template_default_bindings = {
    aoeSize3: '3',
    aoeSize4: '4',
    aoeSize5: '5',
    lock: 'l',
  };
  var template_bindings = R.extend(Object.create(defaultModeService.bindings),
                                   template_default_bindings);
  var template_buttons = [
    [ 'Size', 'toggle', 'size' ],
    [ 'Aoe3', 'aoeSize3', 'size' ],
    [ 'Aoe4', 'aoeSize4', 'size' ],
    [ 'Aoe5', 'aoeSize5', 'size' ],
    [ 'Unlock', 'lock' ],
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
  modesService.registerMode(template_mode);
  settingsService.registerBindings(template_mode.name,
                                   template_default_bindings,
                                   function(bs) {
                                     R.extend(template_mode.bindings, bs);
                                   });
  return template_mode;
};
