'use strict';

angular.module('clickApp.services')
  .factory('sprayTemplateMode', [
    'modes',
    'settings',
    'templateMode',
    'sprayTemplate',
    'game',
    'gameTemplates',
    'gameTemplateSelection',
    'gameModels',
    function sprayTemplateModeServiceFactory(modesService,
                                             settingsService,
                                             templateModeService,
                                             sprayTemplateService,
                                             gameService,
                                             gameTemplatesService,
                                             gameTemplateSelectionService,
                                             gameModelsService) {
      var template_actions = Object.create(templateModeService.actions);
      template_actions.spraySize6 = function spraySize6(scope) {
        var stamps = gameTemplateSelectionService.get('local', scope.game.template_selection);
        return gameService.executeCommand('onTemplates', 'setSize', 6,
                                          stamps, scope, scope.game);
      };
      template_actions.spraySize8 = function spraySize8(scope) {
        var stamps = gameTemplateSelectionService.get('local', scope.game.template_selection);
        return gameService.executeCommand('onTemplates', 'setSize', 8,
                                          stamps, scope, scope.game);
      };
      template_actions.spraySize10 = function spraySize10(scope) {
        var stamps = gameTemplateSelectionService.get('local', scope.game.template_selection);
        return gameService.executeCommand('onTemplates', 'setSize', 10,
                                          stamps, scope, scope.game);
      };
      template_actions.setOriginModel = function spraySetOriginModel(scope, event) {
        var stamps = gameTemplateSelectionService.get('local', scope.game.template_selection);
        return gameService.executeCommand('onTemplates', 'setOrigin',
                                          scope.factions, event['click#'].target,
                                          stamps, scope,  scope.game);
      };
      template_actions.setTargetModel = function spraySetTargetModel(scope, event, dom_event) {
        var stamps = gameTemplateSelectionService.get('local', scope.game.template_selection);
        return R.pipeP(
          gameTemplatesService.findStamp$(stamps[0]),
          sprayTemplateService.origin,
          function(origin) {
            if(R.isNil(origin)) return;

            return gameModelsService.findStamp(origin, scope.game.models);
          },
          function(origin_model) {
            if(R.isNil(origin_model)) return;
          
            return gameService.executeCommand('onTemplates', 'setTarget',
                                              scope.factions, origin_model, event['click#'].target,
                                              stamps, scope,  scope.game);
          }
        )(scope.game.templates);
      };
      var moves = [
        ['rotateLeft', 'left'],
        ['rotateRight', 'right'],
      ];
      function buildTemplateMove(move, small) {
        return function templateMove(scope) {
          var stamps = gameTemplateSelectionService.get('local', scope.game.template_selection);
          return R.pipeP(
            function() {
              return gameTemplatesService.findStamp(stamps[0], scope.game.templates);
            },
            sprayTemplateService.origin,
            function(origin) {
              if(R.isNil(origin)) return;
              
              return gameModelsService.findStamp(origin, scope.game.models);
            },
            function(origin_model) {
              return gameService
                .executeCommand('onTemplates', move[0],
                                scope.factions, origin_model, small,
                                stamps, scope, scope.game);
            }
          )();
        };
      }
      R.forEach(function(move) {
        template_actions[move[0]] = buildTemplateMove(move, false);
        template_actions[move[0]+'Small'] = buildTemplateMove(move, true);
      }, moves);
      var template_default_bindings = {
        setOriginModel: 'ctrl+clickModel',
        setTargetModel: 'shift+clickModel',
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
    }
  ]);
