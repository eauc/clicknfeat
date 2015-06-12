'use strict';

self.modelsModeServiceFactory = function modelsModeServiceFactory(modesService,
                                                                  settingsService,
                                                                  defaultModeService,
                                                                  modelService,
                                                                  gameService,
                                                                  gameModelsService,
                                                                  gameModelSelectionService) {
  var models_actions = Object.create(defaultModeService.actions);
  models_actions.clickMap = function modelsClickMap(scope, event) {
    gameService.executeCommand('setModelSelection', 'clear', null,
                               scope, scope.game);
  };
  models_actions.rightClickMap = function modelsRightClickMap(scope, event) {
    gameService.executeCommand('setModelSelection', 'clear', null,
                               scope, scope.game);
  };
  models_actions.toggleImageDisplay = function modelToggleImageDisplay(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    gameService.executeCommand('onModels', 'toggleImageDisplay',
                               stamps, scope, scope.game);
  };
  models_actions.setNextImage = function modelSetNextImage(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    gameService.executeCommand('onModels', 'setNextImage', scope.factions,
                               stamps, scope, scope.game);
  };
  // models_actions.delete = function modelsDelete(scope) {
  //   var target = gameModelsSelectionService.get('local', scope.game.models_selection);
  //   gameService.executeCommand('deleteModelss', [target], scope, scope.game);
  // };
  // models_actions.lock = function modelsLock(scope) {
  //   var stamp = gameModelsSelectionService.get('local', scope.game.models_selection);
  //   gameService.executeCommand('lockModelss', [stamp], true, scope, scope.game);
  //   modesService.switchToMode(gameModelssService.modeForStamp(stamp, scope.game.modelss),
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
    // models_actions[move[0]] = function modelsMove(scope) {
      // var target = gameModelsSelectionService.get('local', scope.game.models_selection);
      // gameService.executeCommand('onModelss', move[0], false, [target], scope, scope.game);
  //   };
  //   models_actions[move[0]+'Small'] = function modelsMove(scope) {
  //     var target = gameModelsSelectionService.get('local', scope.game.models_selection);
  //     gameService.executeCommand('onModelss', move[0], true, [target], scope, scope.game);
  //   };
  // }, moves);

  // (function() {
  //   var drag_models_start_state;
  //   function updateStateWithDelta(event, state) {
  //     var dx = event.now.x - event.start.x;
  //     var dy = event.now.y - event.start.y;
  //     state.x = drag_models_start_state.x + dx;
  //     state.y = drag_models_start_state.y + dy;
  //   }
  //   models_actions.dragStartModels = function modelsDragStartModels(scope, event) {
  //     drag_models_start_state = R.clone(event.target.state);
  //     models_actions.dragModels(scope, event);
  //     scope.game.models_selection =
  //       gameModelsSelectionService.set('local', event.target.state.stamp,
  //                                        scope, scope.game.models_selection);
  //   };
  //   models_actions.dragModels = function modelsDragModels(scope, event) {
  //     updateStateWithDelta(event, event.target.state);
  //     scope.gameEvent('changeModels-'+event.target.state.stamp);
  //   };
  //   models_actions.dragEndModels = function modelsDragEndModels(scope, event) {
  //     modelsService.setPosition(drag_models_start_state, event.target);
  //     var end_state = R.clone(drag_models_start_state);
  //     updateStateWithDelta(event, end_state);
  //     gameService.executeCommand('onModelss',
  //                                'setPosition', end_state, [event.target.state.stamp],
  //                                scope, scope.game);
  //   };
  // })();

  var models_default_bindings = {
    'toggleImageDisplay': 'i',
    'setNextImage': 'shift+i',
  };
  // R.forEach(function(move) {
  //   models_default_bindings[move[0]] = move[1];
  //   models_default_bindings[move[0]+'Small'] = 'shift+'+move[1];
  // }, moves);
  var models_bindings = R.extend(Object.create(defaultModeService.bindings),
                                 models_default_bindings);
  var models_buttons = [
    [ 'Image', 'toggle', 'image' ],
    [ 'Show/Hide', 'toggleImageDisplay', 'image' ],
    [ 'Next', 'setNextImage', 'image' ],
  ];
  var models_mode = {
    onEnter: function modelsOnEnter(scope) {
    },
    onLeave: function modelsOnLeave(scope) {
    },
    name: 'Models',
    actions: models_actions,
    buttons: models_buttons,
    bindings: models_bindings,
  };
  modesService.registerMode(models_mode);
  settingsService.register('Bindings',
                           models_mode.name,
                           models_default_bindings,
                           function(bs) {
                             R.extend(models_mode.bindings, bs);
                           });
  return models_mode;
};
