'use strict';

(function () {
  angular.module('clickApp.services').factory('createElementMode', createElementModeModelFactory);

  createElementModeModelFactory.$inject = ['appState', 'commonMode'];
  function createElementModeModelFactory(appStateService, commonModeModel) {
    var CREATE_LENS = R.lensProp('create');
    return function createElementModeModel(type) {
      var createElement_actions = Object.create(commonModeModel.actions);
      createElement_actions.modeBackToDefault = modeBackToDefault;
      createElement_actions.moveMap = moveMap;
      createElement_actions.create = create;

      var createElement_default_bindings = {
        'create': 'clickMap'
      };
      var createElement_bindings = R.extend(Object.create(commonModeModel.bindings), createElement_default_bindings);
      var createElement_buttons = [];

      var createElement_mode = {
        onEnter: onEnter,
        onLeave: onLeave,
        name: 'Create' + s.capitalize(type),
        actions: createElement_actions,
        buttons: createElement_buttons,
        bindings: createElement_bindings
      };
      var updateCreateBase$ = R.curry(updateCreateBase);
      return createElement_mode;

      function onEnter() {
        appStateService.emit('Game.moveMap.enable');
      }
      function onLeave() {
        appStateService.emit('Game.moveMap.disable');
      }
      function modeBackToDefault(state) {
        commonModeModel.actions.modeBackToDefault();
        return R.set(CREATE_LENS, {}, state);
      }
      function moveMap(state, coord) {
        return R.over(CREATE_LENS, updateCreateBase$(coord), state);
      }
      function create(state, event) {
        var is_flipped = R.path(['ui_state', 'flip_map'], state);
        var create = R.thread(state)(R.view(CREATE_LENS), updateCreateBase$(event['click#']), R.assoc('factions', state.factions));
        appStateService.chainReduce('Game.command.execute', 'create' + s.capitalize(type), [create, is_flipped]);
        return R.set(CREATE_LENS, {}, state);
      }
      function updateCreateBase(coord, create) {
        return R.over(R.lensProp('base'), R.pipe(R.assoc('x', coord.x), R.assoc('y', coord.y)), create);
      }
    };
  }
})();
//# sourceMappingURL=element.js.map
