'use strict';

angular.module('clickApp.services')
  .factory('aoeTemplateMode', [
    'modes',
    'settings',
    'templateMode',
    'game',
    'gameTemplates',
    'gameTemplateSelection',
    'gameRuler',
    'prompt',
    function aoeTemplateModeServiceFactory(modesService,
                                           settingsService,
                                           templateModeService,
                                           gameService,
                                           gameTemplatesService,
                                           gameTemplateSelectionService,
                                           gameRulerService,
                                           promptService) {
      var template_actions = Object.create(templateModeService.actions);
      template_actions.aoeSize3 = function aoeSize3(scope) {
        var stamps = gameTemplateSelectionService.get('local', scope.game.template_selection);
        return gameService.executeCommand('onTemplates', 'setSize', 3,
                                          stamps, scope, scope.game);
      };
      template_actions.aoeSize4 = function aoeSize4(scope) {
        var stamps = gameTemplateSelectionService.get('local', scope.game.template_selection);
        return gameService.executeCommand('onTemplates', 'setSize', 4,
                                          stamps, scope, scope.game);
      };
      template_actions.aoeSize5 = function aoeSize5(scope) {
        var stamps = gameTemplateSelectionService.get('local', scope.game.template_selection);
        return gameService.executeCommand('onTemplates', 'setSize', 5,
                                          stamps, scope, scope.game);
      };
      template_actions.setTargetModel = function aoeSetTargetModel(scope, event) {
        var stamps = gameTemplateSelectionService.get('local', scope.game.template_selection);
        return gameService.executeCommand('onTemplates',
                                          'setTarget', scope.factions, null, event['click#'].target,
                                          stamps, scope,  scope.game);
      };
      template_actions.setMaxDeviation = function rulerSetMaxDeviation(scope) {
        var stamps = gameTemplateSelectionService.get('local', scope.game.template_selection);
        return R.pipeP(
          function() {
            return gameTemplatesService.onStamps$('maxDeviation', stamps, scope.game.templates);
          },
          function(maxes) {
            var max = maxes[0];
            return promptService.prompt('prompt', 'Set AoE max deviation :', max)
              .catch(function(error) {
                console.log(error);
                return null;
              });
          },
          function(value) {
            value = (value === 0) ? null : value;
            return gameTemplatesService
              .onStamps('setMaxDeviation', value, stamps, scope.game.templates);
          }
        )();
      };
      template_actions.deviate = function aoeDeviate(scope) {
        var stamps = gameTemplateSelectionService.get('local', scope.game.template_selection);
        return R.pipeP(
          function() {
            return gameService.executeCommand$('rollDeviation', scope, scope.game);
          },
          function(deviation) {
            return gameService.executeCommand('onTemplates', 'deviate',
                                              deviation.r, deviation.d,
                                              stamps, scope, scope.game);
          }
        )();
      };
      template_actions.setToRulerTarget = function aoeSetToRulerTarget(scope) {
        if(!gameRulerService.isDisplayed(scope.game.ruler)) return;
        
        var stamps = gameTemplateSelectionService.get('local', scope.game.template_selection);
        return R.pipeP(
          function() {
            return gameRulerService.targetAoEPosition(scope.game.models,
                                                      scope.game.ruler);
          },
          function(position) {
            return gameService.executeCommand('onTemplates',
                                              'setToRuler', position,
                                              stamps, scope, scope.game);
          }
        )();
      };

      var template_default_bindings = {
        setTargetModel: 'shift+clickModel',
        aoeSize3: '3',
        aoeSize4: '4',
        aoeSize5: '5',
        deviate: 'd',
        setMaxDeviation: 'm',
        setToRulerTarget: 'e',
      };
      var template_bindings = R.extend(Object.create(templateModeService.bindings),
                                       template_default_bindings);
      var template_buttons = R.concat([
        [ 'Size', 'toggle', 'size' ],
        [ 'Aoe3', 'aoeSize3', 'size' ],
        [ 'Aoe4', 'aoeSize4', 'size' ],
        [ 'Aoe5', 'aoeSize5', 'size' ],
        [ 'Deviate', 'deviate' ],
        [ 'Set to Ruler', 'setToRulerTarget' ],
      ], templateModeService.buttons);

      var template_mode = {
        onEnter: function templateOnEnter(/*scope*/) {
        },
        onLeave: function templateOnLeave(/*scope*/) {
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
    }
  ]);
