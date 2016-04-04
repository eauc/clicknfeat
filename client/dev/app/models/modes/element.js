'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.services').factory('elementMode', elementModeModelFactory);

  elementModeModelFactory.$inject = ['appState', 'defaultMode'];
  function elementModeModelFactory(appStateService, defaultModeModel) {
    return function buildElementModeModel(type, elementModel, gameElementsModel, gameElementSelectionModel) {
      var ELEMENTS_LENS = R.lensPath(['game', type + 's']);
      var SELECTION_LENS = R.lensPath(['game', type + '_selection']);

      var element_actions = Object.create(defaultModeModel.actions);
      element_actions.modeBackToDefault = clearElementSelection;
      element_actions.clickMap = clearElementSelection;
      element_actions.rightClickMap = clearElementSelection;
      element_actions.copySelection = copySelection;
      element_actions.delete = doDelete;
      element_actions.toggleLock = toggleLock;

      var moves = [['moveFront', 'up'], ['moveBack', 'down'], ['rotateLeft', 'left'], ['rotateRight', 'right']];
      R.forEach(buildMove, moves);
      var shifts = [['shiftUp', 'ctrl+up', 'shiftDown'], ['shiftDown', 'ctrl+down', 'shiftUp'], ['shiftLeft', 'ctrl+left', 'shiftRight'], ['shiftRight', 'ctrl+right', 'shiftLeft']];
      R.forEach(buildShift, shifts);
      buildDrag();

      var element_default_bindings = {
        'clickMap': 'clickMap',
        'rightClickMap': 'rightClickMap',
        'copySelection': 'ctrl+c',
        'delete': 'del',
        'toggleLock': 'l'
      };
      R.forEach(buildMoveBindings, moves);
      R.forEach(buildShiftBindings, shifts);
      var element_bindings = R.extend(Object.create(defaultModeModel.bindings), element_default_bindings);
      var element_buttons = [['Delete', 'delete'], ['Lock/Unlock', 'toggleLock']];
      var element_mode = {
        onEnter: function onEnter() {},
        onLeave: function onLeave() {},
        name: s.capitalize(type),
        actions: element_actions,
        buttons: element_buttons,
        bindings: element_bindings
      };

      return element_mode;

      function clearElementSelection(state) {
        // appStateService.emit('Game.selectionDetail.close');
        // appStateService.emit('Game.editDamage.close');
        // appStateService.emit('Game.editLabel.close');
        return R.over(SELECTION_LENS, gameElementSelectionModel.clear$('local'), state);
      }
      function copySelection(state) {
        var stamps = R.thread(state)(R.view(SELECTION_LENS), gameElementSelectionModel.get$('local'));
        return R.thread(state)(R.view(ELEMENTS_LENS), gameElementsModel.copyStamps$(stamps), R.assoc('create', R.__, state), R.tap(function () {
          appStateService.chainReduce('Modes.switchTo', 'Create' + s.capitalize(type));
        }));
      }
      function doDelete(state) {
        var stamps = R.thread(state)(R.view(SELECTION_LENS), gameElementSelectionModel.get$('local'));
        appStateService.chainReduce('Game.command.execute', 'delete' + s.capitalize(type), [stamps]);
      }
      function toggleLock(state) {
        var stamps = R.thread(state)(R.view(SELECTION_LENS), gameElementSelectionModel.get$('local'));
        return R.thread(state)(R.view(ELEMENTS_LENS), gameElementsModel.findStamp$(stamps[0]), R.when(R.exists, function (element) {
          var is_locked = elementModel.isLocked(element);
          appStateService.chainReduce('Game.command.execute', 'lock' + s.capitalize(type) + 's', [!is_locked, stamps]);
        }));
      }
      function buildMove(_ref) {
        var _ref2 = _slicedToArray(_ref, 1);

        var move = _ref2[0];

        element_actions[move] = function (state) {
          var stamps = R.thread(state)(R.view(SELECTION_LENS), gameElementSelectionModel.get$('local'));
          appStateService.chainReduce('Game.command.execute', 'on' + s.capitalize(type) + 's', [move + 'P', [false], stamps]);
        };
        element_actions[move + 'Small'] = function (state) {
          var stamps = R.thread(state)(R.view(SELECTION_LENS), gameElementSelectionModel.get$('local'));
          appStateService.chainReduce('Game.command.execute', 'on' + s.capitalize(type) + 's', [move + 'P', [true], stamps]);
        };
      }
      function buildShift(_ref3) {
        var _ref4 = _slicedToArray(_ref3, 3);

        var shift = _ref4[0];
        var _key_ = _ref4[1];
        var flip_shift = _ref4[2];

        element_actions[shift] = function (state) {
          var stamps = R.thread(state)(R.view(SELECTION_LENS), gameElementSelectionModel.get$('local'));
          var element_shift = R.path(['ui_state', 'flip_map'], state) ? flip_shift : shift;
          appStateService.chainReduce('Game.command.execute', 'on' + s.capitalize(type) + 's', [element_shift + 'P', [false], stamps]);
        };
        element_actions[shift + 'Small'] = function (state) {
          var stamps = R.thread(state)(R.view(SELECTION_LENS), gameElementSelectionModel.get$('local'));
          var element_shift = R.path(['ui_state', 'flip_map'], state) ? flip_shift : shift;
          appStateService.chainReduce('Game.command.execute', 'on' + s.capitalize(type) + 's', [element_shift + 'P', [true], stamps]);
        };
      }

      function buildDrag() {
        element_actions['dragStart' + s.capitalize(type)] = dragStartElement;
        defaultModeModel.actions['dragStart' + s.capitalize(type)] = dragStartElement;
        element_actions['drag' + s.capitalize(type)] = dragElement;
        element_actions['dragEnd' + s.capitalize(type)] = dragEndElement;

        var drag_element_start_state = undefined;
        function dragStartElement(state, event) {
          var element = event.target;
          if (elementModel.isLocked(element)) {
            return R.rejectP(s.capitalize(type) + ' is locked');
          }
          drag_element_start_state = R.clone(event.target.state);
          updateStateWithDelta(event, event.target.state);
          return R.over(SELECTION_LENS, gameElementSelectionModel.set$('local', [event.target.state.stamp]), state);
        }
        function dragElement(_state_, event) {
          return R.threadP(event.target)(R.rejectIfP(elementModel.isLocked, s.capitalize(type) + ' is locked'), function () {
            updateStateWithDelta(event, event.target.state);
            appStateService.emit('Game.' + type + '.change.' + event.target.state.stamp);
          });
        }
        function dragEndElement(_state_, event) {
          return R.threadP(event.target)(R.rejectIfP(elementModel.isLocked, s.capitalize(type) + ' is locked'), function () {
            event.target.state = R.clone(drag_element_start_state);
            var end_state = R.clone(drag_element_start_state);
            updateStateWithDelta(event, end_state);
            appStateService.chainReduce('Game.command.execute', 'on' + s.capitalize(type) + 's', ['setPositionP', [end_state], [event.target.state.stamp]]);
          });
        }
        function updateStateWithDelta(event, state) {
          var dx = event.now.x - event.start.x;
          var dy = event.now.y - event.start.y;
          state.x = drag_element_start_state.x + dx;
          state.y = drag_element_start_state.y + dy;
        }
      }

      function buildMoveBindings(_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2);

        var move = _ref6[0];
        var keys = _ref6[1];

        element_default_bindings[move] = keys;
        element_default_bindings[move + 'Small'] = 'shift+' + keys;
      }
      function buildShiftBindings(_ref7) {
        var _ref8 = _slicedToArray(_ref7, 2);

        var shift = _ref8[0];
        var keys = _ref8[1];

        element_default_bindings[shift] = keys;
        element_default_bindings[shift + 'Small'] = 'shift+' + keys;
      }
    };
  }
})();
//# sourceMappingURL=element.js.map
