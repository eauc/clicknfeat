'use strict';

angular.module('clickApp.services').factory('createModelMode', ['modes', 'settings', 'commonMode', 'game', function createModelModeServiceFactory(modesService, settingsService, commonModeService) {
  var createModel_actions = Object.create(commonModeService.actions);
  function updateCreateBase(coord, state) {
    state.create = R.over(R.lensPath(['model', 'base']), R.pipe(R.assoc('x', coord.x), R.assoc('y', coord.y)), state.create);
  }
  createModel_actions.moveMap = function (state, coord) {
    updateCreateBase(coord, state);
    return state.changeEvent('Game.create.update');
  };
  createModel_actions.create = function (state, event) {
    var is_flipped = R.path(['ui_state', 'flip_map'], state);
    updateCreateBase(event['click#'], state);
    return state.event('Game.command.execute', 'createModel', [state.create.model, is_flipped]);
  };
  var createModel_default_bindings = {
    'create': 'clickMap'
  };
  var createModel_bindings = R.extend(Object.create(commonModeService.bindings), createModel_default_bindings);
  var createModel_buttons = [];
  var createModel_mode = {
    onEnter: function onEnter(state) {
      state.changeEvent('Game.model.create.enable');
      state.changeEvent('Game.moveMap.enable');
    },
    onLeave: function onLeave(state) {
      state.create.model = null;
      state.changeEvent('Game.moveMap.disable');
      state.changeEvent('Game.model.create.disable');
    },
    name: 'CreateModel',
    actions: createModel_actions,
    buttons: createModel_buttons,
    bindings: createModel_bindings
  };
  modesService.registerMode(createModel_mode);
  settingsService.register('Bindings', createModel_mode.name, createModel_default_bindings, function (bs) {
    R.extend(createModel_mode.bindings, bs);
  });
  return createModel_mode;
}]);
//# sourceMappingURL=createModel.js.map
