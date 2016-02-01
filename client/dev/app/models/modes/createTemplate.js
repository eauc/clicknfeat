'use strict';

angular.module('clickApp.services').factory('createTemplateMode', ['modes', 'settings', 'commonMode', 'game', function createTemplateModeServiceFactory(modesService, settingsService, commonModeService) {
  var createTemplate_actions = Object.create(commonModeService.actions);
  function updateCreateBase(coord, state) {
    state.create = R.over(R.lensPath(['template', 'base']), R.pipe(R.assoc('x', coord.x), R.assoc('y', coord.y)), state.create);
  }
  createTemplate_actions.moveMap = function (state, coord) {
    updateCreateBase(coord, state);
    return state.changeEvent('Game.create.update');
  };
  createTemplate_actions.create = function (state, event) {
    var is_flipped = R.path(['ui_state', 'flip_map'], state);
    updateCreateBase(event['click#'], state);
    return state.event('Game.command.execute', 'createTemplate', [state.create.template, is_flipped]);
  };
  var createTemplate_default_bindings = {
    create: 'clickMap'
  };
  var createTemplate_bindings = R.extend(Object.create(commonModeService.bindings), createTemplate_default_bindings);
  var createTemplate_buttons = [];
  var createTemplate_mode = {
    onEnter: function onEnter(state) {
      state.changeEvent('Game.template.create.enable');
      state.changeEvent('Game.moveMap.enable');
    },
    onLeave: function createTemplateOnLeave(state) {
      state.create = R.assoc('template', null, state.create);
      state.changeEvent('Game.moveMap.disable');
      state.changeEvent('Game.template.create.disable');
    },
    name: 'CreateTemplate',
    actions: createTemplate_actions,
    buttons: createTemplate_buttons,
    bindings: createTemplate_bindings
  };
  modesService.registerMode(createTemplate_mode);
  settingsService.register('Bindings', createTemplate_mode.name, createTemplate_default_bindings, function (bs) {
    R.extend(createTemplate_mode.bindings, bs);
  });
  return createTemplate_mode;
}]);
//# sourceMappingURL=createTemplate.js.map
