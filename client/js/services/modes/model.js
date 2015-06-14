'use strict';

self.modelModeServiceFactory = function modelModeServiceFactory(modesService,
                                                                settingsService,
                                                                modelsModeService,
                                                                modelService,
                                                                gameService,
                                                                gameModelsService,
                                                                gameModelSelectionService) {
  var model_actions = Object.create(modelsModeService.actions);
  // model_actions.delete = function modelDelete(scope) {
  //   var target = gameModelSelectionService.get('local', scope.game.model_selection);
  //   gameService.executeCommand('deleteModels', [target], scope, scope.game);
  // };
  // model_actions.lock = function modelLock(scope) {
  //   var stamp = gameModelSelectionService.get('local', scope.game.model_selection);
  //   gameService.executeCommand('lockModels', [stamp], true, scope, scope.game);
  //   modesService.switchToMode(gameModelsService.modeForStamp(stamp, scope.game.models),
  //                             scope, scope.modes);
  // };
  // var moves = [
  //   ['moveFront', 'up'],
  //   ['moveBack', 'down'],
  //   ['rotateLeft', 'left'],
  //   ['rotateRight', 'right'],
  //   ['shiftUp', 'ctrl+up'],
  //   ['shiftDown', 'ctrl+down'],
  //   ['shiftLeft', 'ctrl+left'],
  //   ['shiftRight', 'ctrl+right'],
  // ];
  // R.forEach(function(move) {
    // model_actions[move[0]] = function modelMove(scope) {
      // var target = gameModelSelectionService.get('local', scope.game.model_selection);
      // gameService.executeCommand('onModels', move[0], false, [target], scope, scope.game);
  //   };
  //   model_actions[move[0]+'Small'] = function modelMove(scope) {
  //     var target = gameModelSelectionService.get('local', scope.game.model_selection);
  //     gameService.executeCommand('onModels', move[0], true, [target], scope, scope.game);
  //   };
  // }, moves);

  // (function() {
  //   var drag_model_start_state;
  //   function updateStateWithDelta(event, state) {
  //     var dx = event.now.x - event.start.x;
  //     var dy = event.now.y - event.start.y;
  //     state.x = drag_model_start_state.x + dx;
  //     state.y = drag_model_start_state.y + dy;
  //   }
  //   model_actions.dragStartModel = function modelDragStartModel(scope, event) {
  //     drag_model_start_state = R.clone(event.target.state);
  //     model_actions.dragModel(scope, event);
  //     scope.game.model_selection =
  //       gameModelSelectionService.set('local', event.target.state.stamp,
  //                                        scope, scope.game.model_selection);
  //   };
  //   model_actions.dragModel = function modelDragModel(scope, event) {
  //     updateStateWithDelta(event, event.target.state);
  //     scope.gameEvent('changeModel-'+event.target.state.stamp);
  //   };
  //   model_actions.dragEndModel = function modelDragEndModel(scope, event) {
  //     modelService.setPosition(drag_model_start_state, event.target);
  //     var end_state = R.clone(drag_model_start_state);
  //     updateStateWithDelta(event, end_state);
  //     gameService.executeCommand('onModels',
  //                                'setPosition', end_state, [event.target.state.stamp],
  //                                scope, scope.game);
  //   };
  // })();

  var model_default_bindings = {
  };
  // R.forEach(function(move) {
  //   model_default_bindings[move[0]] = move[1];
  //   model_default_bindings[move[0]+'Small'] = 'shift+'+move[1];
  // }, moves);
  var model_bindings = R.extend(Object.create(modelsModeService.bindings),
                                 model_default_bindings);
  var model_buttons = [
    [ 'Image', 'toggle', 'image' ],
    [ 'Show/Hide', 'toggleImageDisplay', 'image' ],
    [ 'Next', 'setNextImage', 'image' ],
    [ 'Orient.', 'toggle', 'orientation' ],
    [ 'Face Up', 'setOrientationUp', 'orientation' ],
    [ 'Face Down', 'setOrientationDown', 'orientation' ],
  ];
  var model_mode = {
    onEnter: function modelOnEnter(scope) {
    },
    onLeave: function modelOnLeave(scope) {
    },
    name: 'Model',
    actions: model_actions,
    buttons: model_buttons,
    bindings: model_bindings,
  };
  modesService.registerMode(model_mode);
  settingsService.register('Bindings',
                           model_mode.name,
                           model_default_bindings,
                           function(bs) {
                             R.extend(model_mode.bindings, bs);
                           });
  return model_mode;
};
