'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

angular.module('clickApp.services').factory('templateMode', ['modes', 'settings', 'defaultMode', 'template', 'game', 'gameTemplates', 'gameTemplateSelection', function templateModeServiceFactory(modesService, settingsService, defaultModeService, templateService, gameService, gameTemplatesService, gameTemplateSelectionService) {
  var template_actions = Object.create(defaultModeService.actions);
  function clearTemplateSelection(state) {
    return state.event('Game.update', R.lensProp('template_selection'), gameTemplateSelectionService.clear$('local', state));
  }
  template_actions.modeBackToDefault = clearTemplateSelection;
  template_actions.clickMap = clearTemplateSelection;
  template_actions.rightClickMap = clearTemplateSelection;
  template_actions.delete = function (state) {
    var stamps = gameTemplateSelectionService.get('local', state.game.template_selection);
    return state.event('Game.command.execute', 'deleteTemplates', [stamps]);
  };
  template_actions.toggleLock = function (state) {
    var stamps = gameTemplateSelectionService.get('local', state.game.template_selection);
    return R.pipeP(function () {
      return gameTemplatesService.findStamp(stamps[0], state.game.templates);
    }, function (template) {
      var is_locked = templateService.isLocked(template);

      return state.event('Game.command.execute', 'lockTemplates', [!is_locked, stamps]);
    })();
  };
  var moves = [['moveFront', 'up'], ['moveBack', 'down'], ['rotateLeft', 'left'], ['rotateRight', 'right']];
  R.forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 1);

    var move = _ref2[0];

    template_actions[move] = function (state) {
      var stamps = gameTemplateSelectionService.get('local', state.game.template_selection);
      return state.event('Game.command.execute', 'onTemplates', [move, [false], stamps]);
    };
    template_actions[move + 'Small'] = function (state) {
      var stamps = gameTemplateSelectionService.get('local', state.game.template_selection);
      return state.event('Game.command.execute', 'onTemplates', [move, [true], stamps]);
    };
  }, moves);
  var shifts = [['shiftUp', 'ctrl+up', 'shiftDown'], ['shiftDown', 'ctrl+down', 'shiftUp'], ['shiftLeft', 'ctrl+left', 'shiftRight'], ['shiftRight', 'ctrl+right', 'shiftLeft']];
  R.forEach(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 3);

    var shift = _ref4[0];
    var key = _ref4[1];
    var flip_shift = _ref4[2];

    key = key;
    template_actions[shift] = function (state) {
      var stamps = gameTemplateSelectionService.get('local', state.game.template_selection);
      var template_shift = R.path(['ui_state', 'flip_map'], state) ? flip_shift : shift;
      return state.event('Game.command.execute', 'onTemplates', [template_shift, [false], stamps]);
    };
    template_actions[shift + 'Small'] = function (state) {
      var stamps = gameTemplateSelectionService.get('local', state.game.template_selection);
      var template_shift = R.path(['ui_state', 'flip_map'], state) ? flip_shift : shift;
      return state.event('Game.command.execute', 'onTemplates', [template_shift, [true], stamps]);
    };
  }, shifts);

  (function () {
    var drag_template_start_state = undefined;
    function updateStateWithDelta(event, state) {
      var dx = event.now.x - event.start.x;
      var dy = event.now.y - event.start.y;
      state.x = drag_template_start_state.x + dx;
      state.y = drag_template_start_state.y + dy;
    }
    template_actions.dragStartTemplate = function (state, event) {
      if (templateService.isLocked(event.target)) {
        return self.Promise.reject('Template is locked');
      }

      drag_template_start_state = R.clone(event.target.state);
      template_actions.dragTemplate(state, event);
      return state.event('Game.update', R.lensProp('template_selection'), gameTemplateSelectionService.set$('local', [event.target.state.stamp], state));
    };
    defaultModeService.actions.dragStartTemplate = template_actions.dragStartTemplate;
    template_actions.dragTemplate = function (state, event) {
      if (templateService.isLocked(event.target)) {
        return self.Promise.reject('Template is locked');
      }

      updateStateWithDelta(event, event.target.state);
      state.changeEvent('Game.template.change.' + event.target.state.stamp);
      return null;
    };
    template_actions.dragEndTemplate = function (state, event) {
      if (templateService.isLocked(event.target)) {
        return self.Promise.reject('Template is locked');
      }

      event.target.state.x = drag_template_start_state.x;
      event.target.state.y = drag_template_start_state.y;

      var end_state = R.clone(drag_template_start_state);
      updateStateWithDelta(event, end_state);

      return state.event('Game.command.execute', 'onTemplates', ['setPosition', [end_state], [event.target.state.stamp]]);
    };
  })();

  var template_default_bindings = {
    'clickMap': 'clickMap',
    'rightClickMap': 'rightClickMap',
    'delete': 'del',
    'toggleLock': 'l'
  };
  R.forEach(function (_ref5) {
    var _ref6 = _slicedToArray(_ref5, 2);

    var move = _ref6[0];
    var key = _ref6[1];

    template_default_bindings[move] = key;
    template_default_bindings[move + 'Small'] = 'shift+' + key;
  }, moves);
  R.forEach(function (_ref7) {
    var _ref8 = _slicedToArray(_ref7, 2);

    var shift = _ref8[0];
    var key = _ref8[1];

    template_default_bindings[shift] = key;
    template_default_bindings[shift + 'Small'] = 'shift+' + key;
  }, shifts);
  var template_bindings = R.extend(Object.create(defaultModeService.bindings), template_default_bindings);
  var template_buttons = [['Delete', 'delete'], ['Lock/Unlock', 'toggleLock']];
  var template_mode = {
    onEnter: function onEnter() {},
    onLeave: function onLeave() {},
    name: 'Template',
    actions: template_actions,
    buttons: template_buttons,
    bindings: template_bindings
  };
  // modesService.registerMode(template_mode);
  settingsService.register('Bindings', template_mode.name, template_default_bindings, function (bs) {
    R.extend(template_mode.bindings, bs);
  });
  return template_mode;
}]);
//# sourceMappingURL=template.js.map
