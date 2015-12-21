'use strict';

angular.module('clickApp.services').factory('defaultMode', ['modes', 'settings', 'commonMode', 'game', 'template', 'gameTemplateSelection', 'gameModels', 'gameModelSelection', 'gameTerrainSelection', function defaultModeServiceFactory(modesService, settingsService, commonModeService, gameService, templateService, gameTemplateSelectionService, gameModelsService, gameModelSelectionService, gameTerrainSelectionService) {
  var default_actions = Object.create(commonModeService.actions);
  function clearTerrainSelection(scope) {
    scope.game.terrain_selection = gameTerrainSelectionService.clear('local', scope, scope.game.terrain_selection);
  }
  function clearTemplateSelection(scope) {
    scope.game.template_selection = gameTemplateSelectionService.clear('local', scope, scope.game.template_selection);
  }
  default_actions.setModelSelection = function defaultSetModelSelection(scope, event) {
    clearTerrainSelection(scope, event);
    clearTemplateSelection(scope, event);
    var stamp = event['click#'].target.state.stamp;
    return gameService.executeCommand('setModelSelection', 'set', [stamp], scope, scope.game);
  };
  default_actions.toggleModelSelection = function modelsToggleSelection(scope, event) {
    clearTerrainSelection(scope, event);
    clearTemplateSelection(scope, event);
    var stamp = event['click#'].target.state.stamp;
    if (gameModelSelectionService.in('local', stamp, scope.game.model_selection)) {
      return gameService.executeCommand('setModelSelection', 'removeFrom', [stamp], scope, scope.game);
    } else {
      return gameService.executeCommand('setModelSelection', 'addTo', [stamp], scope, scope.game);
    }
  };
  default_actions.modelSelectionDetail = function defaultModelSelectionDetail(scope, event) {
    clearTerrainSelection(scope, event);
    clearTemplateSelection(scope, event);
    var stamp = event['click#'].target.state.stamp;
    scope.gameEvent('openSelectionDetail', 'model', event['click#'].target);
    return gameService.executeCommand('setModelSelection', 'set', [stamp], scope, scope.game);
  };
  default_actions.selectTemplate = function defaultSelectTemplate(scope, event) {
    clearTerrainSelection(scope, event);
    scope.game.template_selection = gameTemplateSelectionService.set('local', [event['click#'].target.state.stamp], scope, scope.game.template_selection);
  };
  default_actions.templateSelectionDetail = function defaultTemplateSelectionDetail(scope, event) {
    clearTerrainSelection(scope, event);
    scope.gameEvent('openSelectionDetail', 'template', event['click#'].target);
    scope.game.template_selection = gameTemplateSelectionService.set('local', [event['click#'].target.state.stamp], scope, scope.game.template_selection);
  };
  default_actions.selectTerrain = function defaultSelectTerrain(scope, event) {
    clearTemplateSelection(scope, event);
    scope.game.terrain_selection = gameTerrainSelectionService.set('local', [event['click#'].target.state.stamp], scope, scope.game.terrain_selection);
  };
  default_actions.enterRulerMode = function defaultEnterRulerMode(scope) {
    return scope.doSwitchToMode('Ruler');
  };
  default_actions.enterLosMode = function defaultEnterLosMode(scope) {
    return scope.doSwitchToMode('LoS');
  };
  default_actions.dragStartMap = function defaultDragStartMap(scope, event) {
    scope.gameEvent('enableDragbox', event.start, event.now);
  };
  default_actions.dragMap = function defaultDragMap(scope, event) {
    scope.gameEvent('enableDragbox', event.start, event.now);
  };
  default_actions.dragEndMap = function defaultDragEndMap(scope, event) {
    scope.gameEvent('disableDragbox');
    var top_left = {
      x: Math.min(event.now.x, event.start.x),
      y: Math.min(event.now.y, event.start.y)
    };
    var bottom_right = {
      x: Math.max(event.now.x, event.start.x),
      y: Math.max(event.now.y, event.start.y)
    };
    return R.pipeP(gameModelsService.findStampsBetweenPoints$(top_left, bottom_right), function (stamps) {
      if (R.isEmpty(stamps)) {
        return;
      }

      return gameService.executeCommand('setModelSelection', 'set', stamps, scope, scope.game);
    })(scope.game.models);
  };

  var default_default_bindings = {
    enterRulerMode: 'ctrl+r',
    enterLosMode: 'ctrl+l',
    setModelSelection: 'clickModel',
    toggleModelSelection: 'ctrl+clickModel',
    modelSelectionDetail: 'rightClickModel',
    selectTemplate: 'clickTemplate',
    templateSelectionDetail: 'rightClickTemplate',
    selectTerrain: 'clickTerrain'
  };
  var default_bindings = R.extend(Object.create(commonModeService.bindings), default_default_bindings);
  var default_buttons = [];
  var default_mode = {
    name: 'Default',
    onEnter: function defaultOnEnter(scope) {
      gameTemplateSelectionService.checkMode(scope, scope.game.template_selection).catch(function () {
        return gameTerrainSelectionService.checkMode(scope, scope.game.terrain_selection);
      }).catch(function () {
        return gameModelSelectionService.checkMode(scope, scope.game.model_selection);
      });
    },
    actions: default_actions,
    buttons: default_buttons,
    bindings: default_bindings
  };
  modesService.registerMode(default_mode);
  settingsService.register('Bindings', default_mode.name, default_default_bindings, function (bs) {
    R.extend(default_mode.bindings, bs);
  });
  return default_mode;
}]);
//# sourceMappingURL=default.js.map
