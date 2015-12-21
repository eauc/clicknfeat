'use strict';

angular.module('clickApp.services').factory('terrainMode', ['modes', 'settings', 'defaultMode', 'terrain', 'game', 'gameTerrains', 'gameTerrainSelection', function terrainModeServiceFactory(modesService, settingsService, defaultModeService, terrainService, gameService, gameTerrainsService, gameTerrainSelectionService) {
  var terrain_actions = Object.create(defaultModeService.actions);
  function clearTerrainSelection(scope /*, event*/) {
    scope.game.terrain_selection = gameTerrainSelectionService.clear('local', scope, scope.game.terrain_selection);
  }
  terrain_actions.modeBackToDefault = clearTerrainSelection;
  terrain_actions.clickMap = clearTerrainSelection;
  terrain_actions.rightClickMap = clearTerrainSelection;
  terrain_actions.copySelection = function terrainsCopySelection(scope) {
    var stamps = gameTerrainSelectionService.get('local', scope.game.terrain_selection);
    return R.pipeP(gameTerrainsService.copyStamps$(stamps), function (copy) {
      scope.create.terrain = copy;
      return scope.doSwitchToMode('CreateTerrain');
    })(scope.game.terrains);
  };
  terrain_actions.delete = function terrainDelete(scope) {
    var stamps = gameTerrainSelectionService.get('local', scope.game.terrain_selection);
    return gameService.executeCommand('deleteTerrain', stamps, scope, scope.game);
  };
  terrain_actions.toggleLock = function terrainLock(scope) {
    var stamps = gameTerrainSelectionService.get('local', scope.game.terrain_selection);
    return R.pipeP(function () {
      return gameTerrainsService.findStamp(stamps[0], scope.game.terrains);
    }, function (terrain) {
      var is_locked = terrainService.isLocked(terrain);

      return gameService.executeCommand('lockTerrains', !is_locked, stamps, scope, scope.game);
    })();
  };
  var moves = [['moveFront', 'up'], ['moveBack', 'down'], ['rotateLeft', 'left'], ['rotateRight', 'right']];
  R.forEach(function (move) {
    terrain_actions[move[0]] = function terrainMove(scope) {
      var stamps = gameTerrainSelectionService.get('local', scope.game.terrain_selection);
      return gameService.executeCommand('onTerrains', move[0], false, stamps, scope, scope.game);
    };
    terrain_actions[move[0] + 'Small'] = function terrainMove(scope) {
      var stamps = gameTerrainSelectionService.get('local', scope.game.terrain_selection);
      return gameService.executeCommand('onTerrains', move[0], true, stamps, scope, scope.game);
    };
  }, moves);
  var shifts = [['shiftUp', 'ctrl+up', 'shiftDown'], ['shiftDown', 'ctrl+down', 'shiftUp'], ['shiftLeft', 'ctrl+left', 'shiftRight'], ['shiftRight', 'ctrl+right', 'shiftLeft']];
  R.forEach(function (shift) {
    terrain_actions[shift[0]] = function modelsShift(scope) {
      var stamps = gameTerrainSelectionService.get('local', scope.game.terrain_selection);
      var terrain_shift = R.path(['ui_state', 'flip_map'], scope) ? shift[2] : shift[0];
      return gameService.executeCommand('onTerrains', terrain_shift, false, stamps, scope, scope.game);
    };
    terrain_actions[shift[0] + 'Small'] = function terrainsShiftSmall(scope) {
      var stamps = gameTerrainSelectionService.get('local', scope.game.terrain_selection);
      var terrain_shift = R.path(['ui_state', 'flip_map'], scope) ? shift[2] : shift[0];
      return gameService.executeCommand('onTerrains', terrain_shift, true, stamps, scope, scope.game);
    };
  }, shifts);

  (function () {
    var drag_terrain_start_state;
    function updateStateWithDelta(event, state) {
      var dx = event.now.x - event.start.x;
      var dy = event.now.y - event.start.y;
      state.x = drag_terrain_start_state.x + dx;
      state.y = drag_terrain_start_state.y + dy;
    }
    terrain_actions.dragStartTerrain = function terrainDragStartTerrain(scope, event) {
      if (terrainService.isLocked(event.target)) {
        return self.Promise.reject('Terrain is locked');
      }

      drag_terrain_start_state = R.clone(event.target.state);
      terrain_actions.dragTerrain(scope, event);
      scope.game.terrain_selection = gameTerrainSelectionService.set('local', [event.target.state.stamp], scope, scope.game.terrain_selection);
    };
    defaultModeService.actions.dragStartTerrain = terrain_actions.dragStartTerrain;
    terrain_actions.dragTerrain = function terrainDragTerrain(scope, event) {
      if (terrainService.isLocked(event.target)) {
        return self.Promise.reject('Terrain is locked');
      }

      updateStateWithDelta(event, event.target.state);
      scope.gameEvent('changeTerrain-' + event.target.state.stamp);
    };
    terrain_actions.dragEndTerrain = function terrainDragEndTerrain(scope, event) {
      if (terrainService.isLocked(event.target)) {
        return self.Promise.reject('Terrain is locked');
      }

      terrainService.setPosition(drag_terrain_start_state, event.target);
      var end_state = R.clone(drag_terrain_start_state);
      updateStateWithDelta(event, end_state);
      return gameService.executeCommand('onTerrains', 'setPosition', end_state, [event.target.state.stamp], scope, scope.game);
    };
  })();

  var terrain_default_bindings = {
    'clickMap': 'clickMap',
    'rightClickMap': 'rightClickMap',
    'copySelection': 'ctrl+c',
    'delete': 'del',
    'toggleLock': 'l'
  };
  R.forEach(function (move) {
    terrain_default_bindings[move[0]] = move[1];
    terrain_default_bindings[move[0] + 'Small'] = 'shift+' + move[1];
  }, moves);
  R.forEach(function (shift) {
    terrain_default_bindings[shift[0]] = shift[1];
    terrain_default_bindings[shift[0] + 'Small'] = 'shift+' + shift[1];
  }, shifts);
  var terrain_bindings = R.extend(Object.create(defaultModeService.bindings), terrain_default_bindings);
  var terrain_buttons = [['Delete', 'delete'], ['Lock/Unlock', 'toggleLock']];
  var terrain_mode = {
    onEnter: function terrainOnEnter() /*scope*/{},
    onLeave: function terrainOnLeave() /*scope*/{},
    name: 'Terrain',
    actions: terrain_actions,
    buttons: terrain_buttons,
    bindings: terrain_bindings
  };
  modesService.registerMode(terrain_mode);
  settingsService.register('Bindings', terrain_mode.name, terrain_default_bindings, function (bs) {
    R.extend(terrain_mode.bindings, bs);
  });
  return terrain_mode;
}]);
//# sourceMappingURL=terrain.js.map
