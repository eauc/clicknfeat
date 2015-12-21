'use strict';

angular.module('clickApp.services').factory('createTerrainMode', ['modes', 'settings', 'commonMode', 'game', function createTerrainModeServiceFactory(modesService, settingsService, commonModeService, gameService) {
  var createTerrain_actions = Object.create(commonModeService.actions);
  createTerrain_actions.moveMap = function createTerrainMoveMap(scope, coord) {
    scope.create.terrain.base.x = coord.x;
    scope.create.terrain.base.y = coord.y;
    scope.gameEvent('moveCreateTerrain');
  };
  createTerrain_actions.create = function createTerrainCreate(scope, event) {
    scope.create.terrain.base.x = event['click#'].x;
    scope.create.terrain.base.y = event['click#'].y;
    var is_flipped = R.path(['ui_state', 'flip_map'], scope);
    return gameService.executeCommand('createTerrain', scope.create.terrain, is_flipped, scope, scope.game);
  };
  var createTerrain_default_bindings = {
    'create': 'clickMap'
  };
  var createTerrain_bindings = R.extend(Object.create(commonModeService.bindings), createTerrain_default_bindings);
  var createTerrain_buttons = [];
  var createTerrain_mode = {
    onEnter: function createTerrainOnEnter(scope) {
      scope.gameEvent('enableCreateTerrain');
      scope.gameEvent('enableMoveMap');
    },
    onLeave: function createTerrainOnLeave(scope) {
      scope.create.terrain = null;
      scope.gameEvent('disableMoveMap');
      scope.gameEvent('disableCreateTerrain');
    },
    name: 'CreateTerrain',
    actions: createTerrain_actions,
    buttons: createTerrain_buttons,
    bindings: createTerrain_bindings
  };
  modesService.registerMode(createTerrain_mode);
  settingsService.register('Bindings', createTerrain_mode.name, createTerrain_default_bindings, function (bs) {
    R.extend(createTerrain_mode.bindings, bs);
  });
  return createTerrain_mode;
}]);
//# sourceMappingURL=createTerrain.js.map
