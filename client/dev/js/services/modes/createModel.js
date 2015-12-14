'use strict';

angular.module('clickApp.services').factory('createModelMode', ['modes', 'settings', 'commonMode', 'game', function createModelModeServiceFactory(modesService, settingsService, commonModeService, gameService) {
  var createModel_actions = Object.create(commonModeService.actions);
  createModel_actions.moveMap = function createModelMoveMap(scope, coord) {
    scope.create.model.base.x = coord.x;
    scope.create.model.base.y = coord.y;
    scope.gameEvent('moveCreateModel');
  };
  createModel_actions.create = function createModelCreate(scope, event) {
    scope.create.model.base.x = event['click#'].x;
    scope.create.model.base.y = event['click#'].y;
    var is_flipped = R.path(['ui_state', 'flip_map'], scope);
    return gameService.executeCommand('createModel', scope.create.model, is_flipped, scope, scope.game);
  };
  var createModel_default_bindings = {
    'create': 'clickMap'
  };
  var createModel_bindings = R.extend(Object.create(commonModeService.bindings), createModel_default_bindings);
  var createModel_buttons = [];
  var createModel_mode = {
    onEnter: function createModelOnEnter(scope) {
      scope.gameEvent('enableCreateModel');
      scope.gameEvent('enableMoveMap');
    },
    onLeave: function createModelOnLeave(scope) {
      scope.create.model = null;
      scope.gameEvent('disableMoveMap');
      scope.gameEvent('disableCreateModel');
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