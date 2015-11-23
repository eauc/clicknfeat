'use strict';

angular.module('clickApp.services')
  .factory('templateMode', [
    'modes',
    'settings',
    'defaultMode',
    'template',
    'game',
    'gameTemplates',
    'gameTemplateSelection',
    function templateModeServiceFactory(modesService,
                                        settingsService,
                                        defaultModeService,
                                        templateService,
                                        gameService,
                                        gameTemplatesService,
                                        gameTemplateSelectionService) {
      var template_actions = Object.create(defaultModeService.actions);
      template_actions.modeBackToDefault = function templateModeBackToDefault(scope, event) {
        scope.game.template_selection =
          gameTemplateSelectionService.clear('local', scope, scope.game.template_selection);
      };
      template_actions.clickMap = template_actions.modeBackToDefault;
      template_actions.rightClickMap = template_actions.modeBackToDefault;
      template_actions.delete = function templateDelete(scope) {
        var stamps = gameTemplateSelectionService.get('local', scope.game.template_selection);
        return gameService.executeCommand('deleteTemplates', stamps,
                                          scope, scope.game);
      };
      template_actions.toggleLock = function templateLock(scope) {
        var stamps = gameTemplateSelectionService.get('local', scope.game.template_selection);
        return gameTemplatesService.findStamp(stamps[0], scope.game.templates)
          .then(function(template) {
            var is_locked = templateService.isLocked(template);
        
            return gameService
              .executeCommand('lockTemplates', !is_locked, stamps,
                              scope, scope.game);
          });
      };
      var moves = [
        ['moveFront', 'up'],
        ['moveBack', 'down'],
        ['rotateLeft', 'left'],
        ['rotateRight', 'right'],
        ['shiftUp', 'ctrl+up'],
        ['shiftDown', 'ctrl+down'],
        ['shiftLeft', 'ctrl+left'],
        ['shiftRight', 'ctrl+right'],
      ];
      R.forEach(function(move) {
        template_actions[move[0]] = function templateMove(scope) {
          var stamps = gameTemplateSelectionService.get('local', scope.game.template_selection);
          return gameService.executeCommand('onTemplates', move[0], false,
                                            stamps, scope, scope.game);
        };
        template_actions[move[0]+'Small'] = function templateMove(scope) {
          var stamps = gameTemplateSelectionService.get('local', scope.game.template_selection);
          return gameService.executeCommand('onTemplates', move[0], true,
                                            stamps, scope, scope.game);
        };
      }, moves);

      (function() {
        var drag_template_start_state;
        function updateStateWithDelta(event, state) {
          var dx = event.now.x - event.start.x;
          var dy = event.now.y - event.start.y;
          state.x = drag_template_start_state.x + dx;
          state.y = drag_template_start_state.y + dy;
        }
        template_actions.dragStartTemplate = function templateDragStartTemplate(scope, event) {
          if(templateService.isLocked(event.target)) {
            return self.Promise.reject('Template is locked');
          }
          drag_template_start_state = R.clone(event.target.state);
          template_actions.dragTemplate(scope, event);
          scope.game.template_selection =
            gameTemplateSelectionService.set('local', [event.target.state.stamp],
                                             scope, scope.game.template_selection);
        };
        defaultModeService.actions.dragStartTemplate = template_actions.dragStartTemplate;
        template_actions.dragTemplate = function templateDragTemplate(scope, event) {
          if(templateService.isLocked(event.target)) {
            return self.Promise.reject('Template is locked');
          }
          updateStateWithDelta(event, event.target.state);
          scope.gameEvent('changeTemplate-'+event.target.state.stamp);
        };
        template_actions.dragEndTemplate = function templateDragEndTemplate(scope, event) {
          if(templateService.isLocked(event.target)) {
            return self.Promise.reject('Template is locked');
          }
          templateService.setPosition(drag_template_start_state, event.target);
          var end_state = R.clone(drag_template_start_state);
          updateStateWithDelta(event, end_state);
          return gameService.executeCommand('onTemplates', 'setPosition', end_state,
                                            [event.target.state.stamp],
                                            scope, scope.game);
        };
      })();

      var template_default_bindings = {
        'clickMap': 'clickMap',
        'rightClickMap': 'rightClickMap',
        'delete': 'del',
        'toggleLock': 'l',
      };
      R.forEach(function(move) {
        template_default_bindings[move[0]] = move[1];
        template_default_bindings[move[0]+'Small'] = 'shift+'+move[1];
      }, moves);
      var template_bindings = R.extend(Object.create(defaultModeService.bindings),
                                       template_default_bindings);
      var template_buttons = [
        [ 'Delete', 'delete' ],
        [ 'Lock/Unlock', 'toggleLock' ],
      ];
      var template_mode = {
        onEnter: function templateOnEnter(scope) {
        },
        onLeave: function templateOnLeave(scope) {
        },
        name: 'Template',
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
    }
  ]);
