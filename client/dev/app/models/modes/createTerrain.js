'use strict';

(function () {
  angular.module('clickApp.services').factory('createTerrainMode', createTerrainModeModelFactory);

  createTerrainModeModelFactory.$inject = ['modes', 'settings', 'commonMode'];
  function createTerrainModeModelFactory(modesModel, settingsModel, commonModeModel) {
    var createTerrain_actions = Object.create(commonModeModel.actions);
    createTerrain_actions.moveMap = moveMap;
    createTerrain_actions.create = create;

    var createTerrain_default_bindings = {
      'create': 'clickMap'
    };
    var createTerrain_bindings = R.extend(Object.create(commonModeModel.bindings), createTerrain_default_bindings);
    var createTerrain_buttons = [];

    var createTerrain_mode = {
      onEnter: onEnter,
      onLeave: onLeave,
      name: 'CreateTerrain',
      actions: createTerrain_actions,
      buttons: createTerrain_buttons,
      bindings: createTerrain_bindings
    };

    modesModel.registerMode(createTerrain_mode);
    settingsModel.register('Bindings', createTerrain_mode.name, createTerrain_default_bindings, function (bs) {
      R.extend(createTerrain_mode.bindings, bs);
    });
    return createTerrain_mode;

    function onEnter(state) {
      state.queueChangeEventP('Game.terrain.create.enable');
      state.queueChangeEventP('Game.moveMap.enable');
    }
    function onLeave(state) {
      state.create = R.assoc('terrains', null, state.create);
      state.queueChangeEventP('Game.moveMap.disable');
      state.queueChangeEventP('Game.terrain.create.disable');
    }
    function moveMap(state, coord) {
      updateCreateBase(coord, state);
      state.queueChangeEventP('Game.create.update');
    }
    function create(state, event) {
      var is_flipped = R.path(['ui_state', 'flip_map'], state);
      updateCreateBase(event['click#'], state);
      return state.eventP('Game.command.execute', 'createTerrain', [state.create, is_flipped]);
    }
    function updateCreateBase(coord, state) {
      state.create = R.over(R.lensProp('base'), R.pipe(R.assoc('x', coord.x), R.assoc('y', coord.y)), state.create);
    }
  }
})();
//# sourceMappingURL=createTerrain.js.map
