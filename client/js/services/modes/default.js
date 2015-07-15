'use strict';

self.defaultModeServiceFactory = function defaultModeServiceFactory(modesService,
                                                                    settingsService,
                                                                    commonModeService,
                                                                    gameService,
                                                                    templateService,
                                                                    gameTemplateSelectionService,
                                                                    gameModelsService,
                                                                    gameModelSelectionService) {
  var default_actions = Object.create(commonModeService.actions);
  default_actions.clickModel = function defaultClickModel(scope, event, dom_event) {
    var stamp = event.target.state.stamp;
    if(dom_event.ctrlKey) {
      if(gameModelSelectionService.in('local', stamp, scope.game.model_selection)) {
        gameService.executeCommand('setModelSelection', 'removeFrom', [stamp],
                                   scope, scope.game);
      }
      else {
        gameService.executeCommand('setModelSelection', 'addTo', [stamp],
                                   scope, scope.game);
      }
      return;
    }
    gameService.executeCommand('setModelSelection', 'set', [stamp],
                               scope, scope.game);
  };
  default_actions.rightClickModel = function defaultRightClickModel(scope, event) {
    var stamp = event.target.state.stamp;
    scope.gameEvent('openSelectionDetail', 'model', event.target);
    gameService.executeCommand('setModelSelection', 'set', [stamp],
                               scope, scope.game);
  };
  default_actions.clickTemplate = function defaultClickTemplate(scope, event) {
    scope.game.template_selection =
      gameTemplateSelectionService.set('local', [event.target.state.stamp],
                                       scope, scope.game.template_selection);
  };
  default_actions.rightClickTemplate = function defaultRightClickTemplate(scope, event) {
    scope.gameEvent('openSelectionDetail', 'template', event.target);
    scope.game.template_selection =
      gameTemplateSelectionService.set('local', [event.target.state.stamp],
                                       scope, scope.game.template_selection);
  };
  default_actions.dragStartModel = function defaultDragStartModel(scope, event) {
    scope.game.model_selection =
      gameModelSelectionService.set('local', [event.target.state.stamp],
                                    scope, scope.game.model_selection);
    modesService.currentModeAction('dragStartModel', scope, event, null, scope.modes);
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
  default_actions.dragStartMap = function defaultDragStartMap(scope, event) {
    scope.gameEvent('enableDragbox', event.start, event.now);
  };
  default_actions.dragMap = function defaultDragMap(scope, event) {
    scope.gameEvent('enableDragbox', event.start, event.now);
  };
  default_actions.dragEndMap = function defaultDragEndTemplate(scope, event) {
    scope.gameEvent('disableDragbox');
    var top_left = {
      x: Math.min(event.now.x, event.start.x),
      y: Math.min(event.now.y, event.start.y),
    };
    var bottom_right = {
      x: Math.max(event.now.x, event.start.x),
      y: Math.max(event.now.y, event.start.y),
    };
    var stamps = gameModelsService.findStampsBetweenPoints(top_left, bottom_right,
                                                           scope.game.models);
    console.log('stamps', stamps);
    if(R.isEmpty(stamps)) return;
    gameService.executeCommand('setModelSelection', 'set', stamps,
                               scope, scope.game);
  };

  var default_default_bindings = {
    enterRulerMode: 'shift+r',
  };
  var default_bindings = R.extend(Object.create(commonModeService.bindings),
                                  default_default_bindings);
  var default_buttons = [];
  var default_mode = {
    name: 'Default',
    onEnter: function defaultOnEnter(scope) {
      self.requestAnimationFrame(function _defaultOnEnter() {
        if(gameTemplateSelectionService.checkMode(scope, scope.game.template_selection)) {
          return;
        }
        gameModelSelectionService.checkMode(scope, scope.game.model_selection);
      });
    },
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
