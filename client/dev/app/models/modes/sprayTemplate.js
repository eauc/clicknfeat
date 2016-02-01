'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

angular.module('clickApp.services').factory('sprayTemplateMode', ['modes', 'settings', 'templateMode', 'sprayTemplate', 'game', 'gameTemplates', 'gameTemplateSelection', 'gameModels', function sprayTemplateModeServiceFactory(modesService, settingsService, templateModeService, sprayTemplateService, gameService, gameTemplatesService, gameTemplateSelectionService, gameModelsService) {
  var template_actions = Object.create(templateModeService.actions);
  template_actions.spraySize6 = function (state) {
    var stamps = gameTemplateSelectionService.get('local', state.game.template_selection);
    return state.event('Game.command.execute', 'onTemplates', ['setSize', [6], stamps]);
  };
  template_actions.spraySize8 = function (state) {
    var stamps = gameTemplateSelectionService.get('local', state.game.template_selection);
    return state.event('Game.command.execute', 'onTemplates', ['setSize', [8], stamps]);
  };
  template_actions.spraySize10 = function (state) {
    var stamps = gameTemplateSelectionService.get('local', state.game.template_selection);
    return state.event('Game.command.execute', 'onTemplates', ['setSize', [10], stamps]);
  };
  template_actions.setOriginModel = function (state, event) {
    var stamps = gameTemplateSelectionService.get('local', state.game.template_selection);
    return state.event('Game.command.execute', 'onTemplates', ['setOrigin', [state.factions, event['click#'].target], stamps]);
  };
  template_actions.setTargetModel = function (state, event) {
    var stamps = gameTemplateSelectionService.get('local', state.game.template_selection);
    return R.pipeP(gameTemplatesService.findStamp$(stamps[0]), sprayTemplateService.origin, function (origin) {
      if (R.isNil(origin)) return null;

      return gameModelsService.findStamp(origin, state.game.models);
    }, function (origin_model) {
      if (R.isNil(origin_model)) return null;

      return state.event('Game.command.execute', 'onTemplates', ['setTarget', [state.factions, origin_model, event['click#'].target], stamps]);
    })(state.game.templates);
  };
  var moves = [['rotateLeft', 'left'], ['rotateRight', 'right']];
  var buildTemplateMove$ = R.curry(function (move, small, state) {
    var stamps = gameTemplateSelectionService.get('local', state.game.template_selection);
    return R.pipeP(function () {
      return gameTemplatesService.findStamp(stamps[0], state.game.templates);
    }, sprayTemplateService.origin, function (origin) {
      if (R.isNil(origin)) return null;

      return gameModelsService.findStamp(origin, state.game.models);
    }, function (origin_model) {
      return state.event('Game.command.execute', 'onTemplates', [move, [state.factions, origin_model, small], stamps]);
    })();
  });
  R.forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 1);

    var move = _ref2[0];

    template_actions[move] = buildTemplateMove$(move, false);
    template_actions[move + 'Small'] = buildTemplateMove$(move, true);
  }, moves);
  var template_default_bindings = {
    setOriginModel: 'ctrl+clickModel',
    setTargetModel: 'shift+clickModel',
    spraySize6: '6',
    spraySize8: '8',
    spraySize10: '0'
  };
  var template_bindings = R.extend(Object.create(templateModeService.bindings), template_default_bindings);

  var template_buttons = R.concat([['Size', 'toggle', 'size'], ['Spray6', 'spraySize6', 'size'], ['Spray8', 'spraySize8', 'size'], ['Spray10', 'spraySize10', 'size']], templateModeService.buttons);

  var template_mode = {
    onEnter: function onEnter() {},
    onLeave: function onLeave() {},
    name: 'spray' + templateModeService.name,
    actions: template_actions,
    buttons: template_buttons,
    bindings: template_bindings
  };
  modesService.registerMode(template_mode);
  settingsService.register('Bindings', template_mode.name, template_default_bindings, function (bs) {
    R.extend(template_mode.bindings, bs);
  });
  return template_mode;
}]);
//# sourceMappingURL=sprayTemplate.js.map
