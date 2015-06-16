'use strict';

self.aoeTemplateModeServiceFactory = R.curry(function aoeTemplateModeServiceFactory(locked,
                                                                                    modesService,
                                                                                    settingsService,
                                                                                    templateModeService,
                                                                                    gameService,
                                                                                    gameTemplatesService,
                                                                                    gameTemplateSelectionService,
                                                                                    gameRulerService,
                                                                                    promptService) {
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
  template_actions.clickModel = function aoeClickModel(scope, event, dom_event) {
    var target = gameTemplateSelectionService.get('local', scope.game.template_selection);
    if(dom_event.ctrlKey) {
      gameService.executeCommand('onTemplates', 'setOrigin', scope.factions, event.target,
                                 [target], scope,  scope.game);
      return;
    }
    else if(dom_event.shiftKey) {
      gameService.executeCommand('onTemplates', 'setTarget', scope.factions, null, event.target,
                                 [target], scope,  scope.game);
      return;
    }
    templateModeService.actions.clickModel(scope, event, dom_event);
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
    template_actions.setMaxDeviation = function rulerSetMaxDeviation(scope, event) {
      var target = gameTemplateSelectionService.get('local', scope.game.template_selection);
      var max = gameTemplatesService.onStamp(target, 'maxDeviation', scope.game.templates);
      promptService.prompt('prompt',
                           'Set AoE max deviation :',
                           max)
        .then(function(value) {
          value = (value === 0) ? null : value;
          gameTemplatesService.onStamp(target, 'setMaxDeviation', value, scope.game.templates);
        })
        .catch(function(error) {
          console.log(error);
          gameTemplatesService.onStamp(target, 'setMaxDeviation', null, scope.game.templates);
        });
    };
    template_actions.deviate = function aoeDeviate(scope) {
      var target = gameTemplateSelectionService.get('local', scope.game.template_selection);
      var deviation = gameService.executeCommand('rollDeviation', scope, scope.game);
      gameService.executeCommand('onTemplates', 'deviate',
                                 deviation.r, deviation.d,
                                 [target], scope, scope.game);
    };
    template_actions.setToRulerTarget = function aoeSetToRulerTarget(scope) {
      if(!gameRulerService.isDisplayed(scope.game.ruler)) return;
      
      var target = gameTemplateSelectionService.get('local', scope.game.template_selection);
      var position = gameRulerService.targetAoEPosition(scope.game.models,
                                                        scope.game.ruler);
      gameService.executeCommand('onTemplates', 'setToRuler',
                                 position, [target],
                                 scope, scope.game);
    };
    template_default_bindings['deviate'] = 'd';
    template_default_bindings['setMaxDeviation'] = 'm';
    template_default_bindings['setToRulerTarget'] = 'e';
    template_buttons = R.concat([
      [ 'Deviate', 'deviate' ],
      // [ 'Set Max Dev.', 'setMaxDeviation' ],
      [ 'Set to Ruler', 'setToRulerTarget' ],
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
