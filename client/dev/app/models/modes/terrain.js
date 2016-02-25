'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.services').factory('terrainMode', terrainModeModelFactory);

  terrainModeModelFactory.$inject = ['modes', 'settings', 'defaultMode', 'terrain', 'game', 'gameTerrains', 'gameTerrainSelection'];
  function terrainModeModelFactory(modesModel, settingsModel, defaultModeModel, terrainModel, gameModel, gameTerrainsModel, gameTerrainSelectionModel) {
    var terrain_actions = Object.create(defaultModeModel.actions);
    terrain_actions.modeBackToDefault = clearTerrainSelection;
    terrain_actions.clickMap = clearTerrainSelection;
    terrain_actions.rightClickMap = clearTerrainSelection;
    terrain_actions.copySelection = copySelection;
    terrain_actions.delete = doDelete;
    terrain_actions.toggleLock = toggleLock;

    var moves = [['moveFront', 'up'], ['moveBack', 'down'], ['rotateLeft', 'left'], ['rotateRight', 'right']];
    R.forEach(buildMove, moves);
    var shifts = [['shiftUp', 'ctrl+up', 'shiftDown'], ['shiftDown', 'ctrl+down', 'shiftUp'], ['shiftLeft', 'ctrl+left', 'shiftRight'], ['shiftRight', 'ctrl+right', 'shiftLeft']];
    R.forEach(buildShift, shifts);
    buildDrag();

    var terrain_default_bindings = {
      'clickMap': 'clickMap',
      'rightClickMap': 'rightClickMap',
      'copySelection': 'ctrl+c',
      'delete': 'del',
      'toggleLock': 'l'
    };
    R.forEach(buildMoveBindings, moves);
    R.forEach(buildShiftBindings, shifts);
    var terrain_bindings = R.extend(Object.create(defaultModeModel.bindings), terrain_default_bindings);
    var terrain_buttons = [['Delete', 'delete'], ['Lock/Unlock', 'toggleLock']];
    var terrain_mode = {
      onEnter: function onEnter() {},
      onLeave: function onLeave() {},
      name: 'Terrain',
      actions: terrain_actions,
      buttons: terrain_buttons,
      bindings: terrain_bindings
    };

    modesModel.registerMode(terrain_mode);
    settingsModel.register('Bindings', terrain_mode.name, terrain_default_bindings, function (bs) {
      R.extend(terrain_mode.bindings, bs);
    });
    return terrain_mode;

    function clearTerrainSelection(state) {
      return state.eventP('Game.update', R.lensProp('terrain_selection'), gameTerrainSelectionModel.clear$('local', state));
    }
    function copySelection(state) {
      var stamps = gameTerrainSelectionModel.get('local', state.game.terrain_selection);
      return R.threadP(state.game.terrains)(gameTerrainsModel.copyStampsP$(stamps), function (copy) {
        state.create = copy;
        return state.eventP('Modes.switchTo', 'CreateTerrain');
      });
    }
    function doDelete(state) {
      var stamps = gameTerrainSelectionModel.get('local', state.game.terrain_selection);
      return state.eventP('Game.command.execute', 'deleteTerrain', [stamps]);
    }
    function toggleLock(state) {
      var stamps = gameTerrainSelectionModel.get('local', state.game.terrain_selection);
      return R.threadP(state.game.terrains)(gameTerrainsModel.findStampP$(stamps[0]), function (terrain) {
        var is_locked = terrainModel.isLocked(terrain);
        return state.eventP('Game.command.execute', 'lockTerrains', [!is_locked, stamps]);
      });
    }
    function buildMove(_ref) {
      var _ref2 = _slicedToArray(_ref, 1);

      var move = _ref2[0];

      terrain_actions[move] = function (state) {
        var stamps = gameTerrainSelectionModel.get('local', state.game.terrain_selection);
        return state.eventP('Game.command.execute', 'onTerrains', [move + 'P', [false], stamps]);
      };
      terrain_actions[move + 'Small'] = function (state) {
        var stamps = gameTerrainSelectionModel.get('local', state.game.terrain_selection);
        return state.eventP('Game.command.execute', 'onTerrains', [move + 'P', [true], stamps]);
      };
    }
    function buildShift(_ref3) {
      var _ref4 = _slicedToArray(_ref3, 3);

      var shift = _ref4[0];
      var key = _ref4[1];
      var flip_shift = _ref4[2];

      terrain_actions[shift] = function (state) {
        var stamps = gameTerrainSelectionModel.get('local', state.game.terrain_selection);
        var terrain_shift = R.path(['ui_state', 'flip_map'], state) ? flip_shift : shift;
        return state.eventP('Game.command.execute', 'onTerrains', [terrain_shift + 'P', [false], stamps]);
      };
      terrain_actions[shift + 'Small'] = function (state) {
        var stamps = gameTerrainSelectionModel.get('local', state.game.terrain_selection);
        var terrain_shift = R.path(['ui_state', 'flip_map'], state) ? flip_shift : shift;
        return state.eventP('Game.command.execute', 'onTerrains', [terrain_shift + 'P', [true], stamps]);
      };
    }

    function buildDrag() {
      var drag_terrain_start_state = undefined;
      terrain_actions.dragStartTerrain = function (state, event) {
        return R.threadP(event.target)(R.rejectIf(terrainModel.isLocked, 'Terrain is locked'), function () {
          drag_terrain_start_state = R.clone(event.target.state);
          return terrain_actions.dragTerrain(state, event);
        }, function () {
          return state.eventP('Game.update', R.lensProp('terrain_selection'), gameTerrainSelectionModel.set$('local', [event.target.state.stamp], state));
        });
      };
      defaultModeModel.actions.dragStartTerrain = terrain_actions.dragStartTerrain;
      terrain_actions.dragTerrain = function (state, event) {
        return R.threadP(event.target)(R.rejectIf(terrainModel.isLocked, 'Terrain is locked'), function () {
          updateStateWithDelta(event, event.target.state);
          state.queueChangeEventP('Game.terrain.change.' + event.target.state.stamp);
        });
      };
      terrain_actions.dragEndTerrain = function (state, event) {
        return R.threadP(event.target)(R.rejectIf(terrainModel.isLocked, 'Terrain is locked'), function () {
          event.target.state = R.clone(drag_terrain_start_state);
          var end_state = R.clone(drag_terrain_start_state);
          updateStateWithDelta(event, end_state);
          return state.eventP('Game.command.execute', 'onTerrains', ['setPositionP', [end_state], [event.target.state.stamp]]);
        });
      };
      function updateStateWithDelta(event, state) {
        var dx = event.now.x - event.start.x;
        var dy = event.now.y - event.start.y;
        state.x = drag_terrain_start_state.x + dx;
        state.y = drag_terrain_start_state.y + dy;
      }
    }

    function buildMoveBindings(_ref5) {
      var _ref6 = _slicedToArray(_ref5, 2);

      var move = _ref6[0];
      var keys = _ref6[1];

      terrain_default_bindings[move] = keys;
      terrain_default_bindings[move + 'Small'] = 'shift+' + keys;
    }
    function buildShiftBindings(_ref7) {
      var _ref8 = _slicedToArray(_ref7, 2);

      var shift = _ref8[0];
      var keys = _ref8[1];

      terrain_default_bindings[shift] = keys;
      terrain_default_bindings[shift + 'Small'] = 'shift+' + keys;
    }
  }
})();
//# sourceMappingURL=terrain.js.map
