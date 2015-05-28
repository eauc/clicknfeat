'use strict';

self.templateModeServiceFactory = function templateModeServiceFactory(modesService,
                                                                      settingsService,
                                                                      templateLockedModeService,
                                                                      templateService,
                                                                      gameService,
                                                                      gameTemplateSelectionService) {
  var template_actions = Object.create(templateLockedModeService.actions);
  template_actions.delete = function templateDelete(scope) {
    var target = gameTemplateSelectionService.getLocal(scope.game.template_selection);
    gameService.executeCommand('deleteTemplates', [target], scope, scope.game);
  };
  template_actions.lock = function templateLock(scope) {
    var target = gameTemplateSelectionService.getLocal(scope.game.template_selection);
    gameService.executeCommand('lockTemplates', [target], true, scope, scope.game);
    modesService.switchToMode('TemplateLocked', scope, scope.modes);
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
      var target = gameTemplateSelectionService.getLocal(scope.game.template_selection);
      gameService.executeCommand('onTemplates', move[0], false, [target], scope, scope.game);
    };
    template_actions[move[0]+'Small'] = function templateMove(scope) {
      var target = gameTemplateSelectionService.getLocal(scope.game.template_selection);
      gameService.executeCommand('onTemplates', move[0], true, [target], scope, scope.game);
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
      drag_template_start_state = R.clone(event.target.state);
      template_actions.dragTemplate(scope, event);
      gameTemplateSelectionService.setLocal(event.target.state.stamp,
                                            scope, scope.game.template_selection);
    };
    template_actions.dragTemplate = function templateDragTemplate(scope, event) {
      updateStateWithDelta(event, event.target.state);
      scope.gameEvent('changeTemplate-'+event.target.state.stamp);
    };
    template_actions.dragEndTemplate = function templateDragEndTemplate(scope, event) {
      templateService.setPosition(drag_template_start_state, event.target);
      var end_state = R.clone(drag_template_start_state);
      updateStateWithDelta(event, end_state);
      gameService.executeCommand('onTemplates',
                                 'setPosition', end_state, [event.target.state.stamp],
                                 scope, scope.game);
    };
  })();

  var template_default_bindings = {
    'delete': 'del',
  };
  R.forEach(function(move) {
    template_default_bindings[move[0]] = move[1];
    template_default_bindings[move[0]+'Small'] = 'shift+'+move[1];
  }, moves);
  var template_bindings = R.extend(Object.create(templateLockedModeService.bindings),
                                   template_default_bindings);
  var template_buttons = [
    [ 'Size', 'toggle', 'size' ],
    [ 'Aoe3', 'aoeSize3', 'size' ],
    [ 'Aoe4', 'aoeSize4', 'size' ],
    [ 'Aoe5', 'aoeSize5', 'size' ],
    [ 'Delete', 'delete' ],
    [ 'Lock', 'lock' ],
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
  modesService.registerMode(template_mode);
  settingsService.register('Bindings',
                           template_mode.name,
                           template_default_bindings,
                           function(bs) {
                             R.extend(template_mode.bindings, bs);
                           });
  return template_mode;
};
