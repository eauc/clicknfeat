'use strict';

self.createModelModeServiceFactory = function createModelModeServiceFactory(modesService,
                                                                            commonModeService,
                                                                            gameService) {
  var createModel_actions = Object.create(commonModeService.actions);
  createModel_actions.moveMap = function createModelMoveMap(scope, coord) {
    scope.create.model.base.x = coord.x;
    scope.create.model.base.y = coord.y;
    scope.gameEvent('moveCreateModel');
  };
  createModel_actions.clickMap = function createModelMoveMap(scope, coord) {
    scope.create.model.base.x = coord.x;
    scope.create.model.base.y = coord.y;
    gameService.executeCommand('createModel', scope.create.model,
                               scope, scope.game);
  };
  var createModel_bindings = Object.create(commonModeService.bindings);
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
    bindings: createModel_bindings,
  };
  modesService.registerMode(createModel_mode);
  return createModel_mode;
};
