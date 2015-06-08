'use strict';

self.aoeTemplateModeServiceFactory = R.curry(function aoeTemplateModeServiceFactory(locked,
                                                                                    modesService,
                                                                                    settingsService,
                                                                                    templateModeService,
                                                                                    gameService,
                                                                                    gameTemplateSelectionService) {
  var template_actions = Object.create(templateModeService.actions);
  template_actions.aoeSize3 = function aoeSize3(scope) {
    var target = gameTemplateSelectionService.get('local', scope.game.template_selection);
    gameService.executeCommand('onTemplates', 'setSize', 3, [target], scope, scope.game);
  };
  template_actions.aoeSize4 = function aoeSize4(scope) {
    var target = gameTemplateSelectionService.get('local', scope.game.template_selection);
    gameService.executeCommand('onTemplates', 'setSize', 4, [target], scope, scope.game);
  };
  template_actions.aoeSize5 = function aoeSize5(scope) {
    var target = gameTemplateSelectionService.get('local', scope.game.template_selection);
    gameService.executeCommand('onTemplates', 'setSize', 5, [target], scope, scope.game);
  };
  var template_default_bindings = {
    aoeSize3: '3',
    aoeSize4: '4',
    aoeSize5: '5',
  };
  var template_bindings = R.extend(Object.create(templateModeService.bindings),
                                   template_default_bindings);
  var template_buttons = R.concat([
    [ 'Size', 'toggle', 'size' ],
    [ 'Aoe3', 'aoeSize3', 'size' ],
    [ 'Aoe4', 'aoeSize4', 'size' ],
    [ 'Aoe5', 'aoeSize5', 'size' ],
  ], templateModeService.buttons);
  if(!locked) {
    template_actions.deviate = function aoeDeviate(scope) {
      var target = gameTemplateSelectionService.get('local', scope.game.template_selection);
      var deviation = gameService.executeCommand('rollDeviation', scope, scope.game);
      gameService.executeCommand('onTemplates', 'deviate',
                                 deviation.r, deviation.d,
                                 [target], scope, scope.game);
    };
    template_default_bindings['deviate'] = 'd';
    template_buttons = R.concat([
      [ 'Deviate', 'deviate' ],
    ], template_buttons);
  }
  var template_mode = {
    onEnter: function templateOnEnter(scope) {
    },
    onLeave: function templateOnLeave(scope) {
    },
    name: 'aoe'+templateModeService.name,
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
});
