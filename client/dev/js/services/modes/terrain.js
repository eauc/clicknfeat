'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

angular.module('clickApp.services').factory('terrainMode', ['modes', 'settings', 'defaultMode', 'terrain', 'game', 'gameTerrains', 'gameTerrainSelection', function terrainModeServiceFactory(modesService, settingsService, defaultModeService, terrainService, gameService, gameTerrainsService, gameTerrainSelectionService) {
  var terrain_actions = Object.create(defaultModeService.actions);
  function clearTerrainSelection(state) {
    return state.event('Game.update', R.lensProp('terrain_selection'), gameTerrainSelectionService.clear$('local', state));
  }
  terrain_actions.modeBackToDefault = clearTerrainSelection;
  terrain_actions.clickMap = clearTerrainSelection;
  terrain_actions.rightClickMap = clearTerrainSelection;
  terrain_actions.copySelection = function (state) {
    var stamps = gameTerrainSelectionService.get('local', state.game.terrain_selection);
    return R.pipeP(gameTerrainsService.copyStamps$(stamps), function (copy) {
      state.create.terrain = copy;
      return state.event('Modes.switchTo', 'CreateTerrain');
    })(state.game.terrains);
  };
  terrain_actions.delete = function (state) {
    var stamps = gameTerrainSelectionService.get('local', state.game.terrain_selection);
    return state.event('Game.command.execute', 'deleteTerrain', [stamps]);
  };
  terrain_actions.toggleLock = function (state) {
    var stamps = gameTerrainSelectionService.get('local', state.game.terrain_selection);
    return R.pipeP(function () {
      return gameTerrainsService.findStamp(stamps[0], state.game.terrains);
    }, function (terrain) {
      var is_locked = terrainService.isLocked(terrain);

      return state.event('Game.command.execute', 'lockTerrains', [!is_locked, stamps]);
    })();
  };
  var moves = [['moveFront', 'up'], ['moveBack', 'down'], ['rotateLeft', 'left'], ['rotateRight', 'right']];
  R.forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 1);

    var move = _ref2[0];

    terrain_actions[move] = function (state) {
      var stamps = gameTerrainSelectionService.get('local', state.game.terrain_selection);
      return state.event('Game.command.execute', 'onTerrains', [move, [false], stamps]);
    };
    terrain_actions[move + 'Small'] = function (state) {
      var stamps = gameTerrainSelectionService.get('local', state.game.terrain_selection);
      return state.event('Game.command.execute', 'onTerrains', [move, [true], stamps]);
    };
  }, moves);
  var shifts = [['shiftUp', 'ctrl+up', 'shiftDown'], ['shiftDown', 'ctrl+down', 'shiftUp'], ['shiftLeft', 'ctrl+left', 'shiftRight'], ['shiftRight', 'ctrl+right', 'shiftLeft']];
  R.forEach(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 3);

    var shift = _ref4[0];
    var key = _ref4[1];
    var flip_shift = _ref4[2];

    key = key;
    terrain_actions[shift] = function (state) {
      var stamps = gameTerrainSelectionService.get('local', state.game.terrain_selection);
      var terrain_shift = R.path(['ui_state', 'flip_map'], state) ? flip_shift : shift;
      return state.event('Game.command.execute', 'onTerrains', [terrain_shift, [false], stamps]);
    };
    terrain_actions[shift + 'Small'] = function (state) {
      var stamps = gameTerrainSelectionService.get('local', state.game.terrain_selection);
      var terrain_shift = R.path(['ui_state', 'flip_map'], state) ? flip_shift : shift;
      return state.event('Game.command.execute', 'onTerrains', [terrain_shift, [true], stamps]);
    };
  }, shifts);

  (function () {
    var drag_terrain_start_state = undefined;
    function updateStateWithDelta(event, state) {
      var dx = event.now.x - event.start.x;
      var dy = event.now.y - event.start.y;
      state.x = drag_terrain_start_state.x + dx;
      state.y = drag_terrain_start_state.y + dy;
    }
    terrain_actions.dragStartTerrain = function (state, event) {
      if (terrainService.isLocked(event.target)) {
        return self.Promise.reject('Terrain is locked');
      }

      drag_terrain_start_state = R.clone(event.target.state);
      terrain_actions.dragTerrain(state, event);
      return state.event('Game.update', R.lensProp('terrain_selection'), gameTerrainSelectionService.set$('local', [event.target.state.stamp], state));
    };
    defaultModeService.actions.dragStartTerrain = terrain_actions.dragStartTerrain;
    terrain_actions.dragTerrain = function (state, event) {
      if (terrainService.isLocked(event.target)) {
        return self.Promise.reject('Terrain is locked');
      }

      updateStateWithDelta(event, event.target.state);
      state.changeEvent('Game.terrain.change.' + event.target.state.stamp);
      return null;
    };
    terrain_actions.dragEndTerrain = function (state, event) {
      if (terrainService.isLocked(event.target)) {
        return self.Promise.reject('Terrain is locked');
      }

      event.target.state = R.clone(drag_terrain_start_state);
      var end_state = R.clone(drag_terrain_start_state);
      updateStateWithDelta(event, end_state);
      return state.event('Game.command.execute', 'onTerrains', ['setPosition', [end_state], [event.target.state.stamp]]);
    };
  })();

  var terrain_default_bindings = {
    'clickMap': 'clickMap',
    'rightClickMap': 'rightClickMap',
    'copySelection': 'ctrl+c',
    'delete': 'del',
    'toggleLock': 'l'
  };
  R.forEach(function (_ref5) {
    var _ref6 = _slicedToArray(_ref5, 2);

    var move = _ref6[0];
    var keys = _ref6[1];

    terrain_default_bindings[move] = keys;
    terrain_default_bindings[move + 'Small'] = 'shift+' + keys;
  }, moves);
  R.forEach(function (_ref7) {
    var _ref8 = _slicedToArray(_ref7, 2);

    var shift = _ref8[0];
    var keys = _ref8[1];

    terrain_default_bindings[shift] = keys;
    terrain_default_bindings[shift + 'Small'] = 'shift+' + keys;
  }, shifts);
  var terrain_bindings = R.extend(Object.create(defaultModeService.bindings), terrain_default_bindings);
  var terrain_buttons = [['Delete', 'delete'], ['Lock/Unlock', 'toggleLock']];
  var terrain_mode = {
    onEnter: function onEnter() {},
    onLeave: function onLeave() {},
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
