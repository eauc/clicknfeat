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
  models_actions.toggleCounterDisplay = function modelToggleCounterDisplay(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    gameService.executeCommand('onModels', 'toggleCounterDisplay', 'c',
                               stamps, scope, scope.game);
  };
  models_actions.incrementCounter = function modelIncrementCounter(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    gameService.executeCommand('onModels', 'incrementCounter', 'c',
                               stamps, scope, scope.game);
  };
  models_actions.decrementCounter = function modelDecrementCounter(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    gameService.executeCommand('onModels', 'decrementCounter', 'c',
                               stamps, scope, scope.game);
  };
  models_actions.toggleSoulsDisplay = function modelToggleSoulsDisplay(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    gameService.executeCommand('onModels', 'toggleCounterDisplay', 's',
                               stamps, scope, scope.game);
  };
  models_actions.incrementSouls = function modelIncrementSouls(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    gameService.executeCommand('onModels', 'incrementCounter', 's',
                               stamps, scope, scope.game);
  };
  models_actions.decrementSouls = function modelDecrementSouls(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    gameService.executeCommand('onModels', 'decrementCounter', 's',
                               stamps, scope, scope.game);
  };
  models_actions.toggleLeaderDisplay = function modelToggleLeaderDisplay(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    gameService.executeCommand('onModels', 'toggleLeaderDisplay',
                               stamps, scope, scope.game);
  };
  var effects = [
    [ 'Blind', 'b' ],
    [ 'Corrosion', 'c' ],
    [ 'Disrupt', 'd' ],
    [ 'Fire', 'f' ],
    [ 'Fleeing', 'r' ],
    [ 'KD', 'k' ],
    [ 'Stationary', 's' ],
  ];
  R.forEach(function(effect) {
    models_actions['toggle'+effect[0]+'EffectDisplay'] = function modelToggleEffectDisplay(scope) {
      var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
      gameService.executeCommand('onModels', 'toggleEffectDisplay', effect[1],
                                 stamps, scope, scope.game);
    };
  }, effects);
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
  var moves = [
    ['moveFront', 'up'],
    ['moveBack', 'down'],
    ['rotateLeft', 'left'],
    ['rotateRight', 'right'],
    ['shiftUp', 'ctrl+up'],
    ['shiftDown', 'ctrl+down'],
    ['shiftLeft', 'ctrl+left'],
    ['shiftRight', 'ctrl+right'],
  ];
  R.forEach(function(move) {
    models_actions[move[0]] = function modelsMove(scope) {
      var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
      gameService.executeCommand('onModels', move[0], scope.factions, false,
                                 stamps, scope, scope.game);
    };
    models_actions[move[0]+'Small'] = function modelsMove(scope) {
      var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
      gameService.executeCommand('onModels', move[0], scope.factions, true,
                                 stamps, scope, scope.game);
    };
  }, moves);
  models_actions.setOrientationUp = function modelSetOrientationUp(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    var orientation = scope.ui_state.flip_map ? 180 : 0;
    gameService.executeCommand('onModels', 'setOrientation', scope.factions, orientation,
                               stamps, scope, scope.game);
  };
  models_actions.setOrientationDown = function modelSetOrientationDown(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    var orientation = scope.ui_state.flip_map ? 0 : 180;
    gameService.executeCommand('onModels', 'setOrientation', scope.factions, orientation,
                               stamps, scope, scope.game);
  };

  (function() {
    var drag_models_start_states;
    var drag_models_start_selection;
    models_actions.dragStartModel = function modelsDragStartModel(scope, event) {
      var stamp = event.target.state.stamp;
      if(!gameModelSelectionService.in('local', stamp, scope.game.model_selection)) {
        gameService.executeCommand('setModelSelection', 'set', [stamp],
                                   scope, scope.game);
      }

      drag_models_start_selection = R.pipe(
        gameModelSelectionService.get$('local'),
        R.map(function(stamp) {
          return gameModelsService.findStamp(stamp, scope.game.models);
        })
      )(scope.game.model_selection);
      drag_models_start_states = R.map(modelService.saveState, drag_models_start_selection);

      models_actions.dragModel(scope, event);
    };
    models_actions.dragModel = function modelsDragModel(scope, event) {
      R.pipe(
        R.forEachIndexed(function(model, index) {
          var pos = {
            x: drag_models_start_states[index].x + event.now.x - event.start.x,
            y: drag_models_start_states[index].y + event.now.y - event.start.y,
          };
          modelService.setPosition(scope.factions, pos, model);
        }),
        R.forEach(function(model) {
          scope.gameEvent('changeModel-'+modelService.eventName(model));
        })
      )(drag_models_start_selection);
    };
    models_actions.dragEndModel = function modelsDragEndModel(scope, event) {
      R.pipe(
        R.forEachIndexed(function(model, index) {
          modelService.setPosition(scope.factions, drag_models_start_states[index], model);
        })
      )(drag_models_start_selection);
      var stamps = R.map(R.path(['state','stamp']), drag_models_start_selection);
      var shift = {
        x: event.now.x - event.start.x,
        y: event.now.y - event.start.y,
      };
      gameService.executeCommand('onModels', 'shiftPosition', scope.factions, shift,
                                 stamps, scope, scope.game);
    };
  })();

  var models_default_bindings = {
    'toggleImageDisplay': 'i',
    'setNextImage': 'shift+i',
    'setOrientationUp': 'pageup',
    'setOrientationDown': 'pagedown',
    'toggleCounterDisplay': 'n',
    'incrementCounter': '+',
    'decrementCounter': '-',
    'toggleSoulsDisplay': 's',
    'incrementSouls': 'shift++',
    'decrementSouls': 'shift+-',
    'toggleLeaderDisplay': 'alt+l',
  };
  R.forEach(function(move) {
    models_default_bindings[move[0]] = move[1];
    models_default_bindings[move[0]+'Small'] = 'shift+'+move[1];
  }, moves);
  R.forEach(function(effect) {
    models_default_bindings['toggle'+effect[0]+'EffectDisplay'] = 'alt+'+effect[1];
  }, effects);
  var models_bindings = R.extend(Object.create(defaultModeService.bindings),
                                 models_default_bindings);
  var models_buttons = [
    [ 'Image', 'toggle', 'image' ],
    [ 'Show/Hide', 'toggleImageDisplay', 'image' ],
    [ 'Next', 'setNextImage', 'image' ],
    [ 'Orient.', 'toggle', 'orientation' ],
    [ 'Face Up', 'setOrientationUp', 'orientation' ],
    [ 'Face Down', 'setOrientationDown', 'orientation' ],
    [ 'Counter', 'toggle', 'counter' ],
    [ 'Show/Hide', 'toggleCounterDisplay', 'counter' ],
    [ 'Inc.', 'incrementCounter', 'counter' ],
    [ 'Dec.', 'decrementCounter', 'counter' ],
    [ 'Souls', 'toggle', 'souls' ],
    [ 'Show/Hide', 'toggleSoulsDisplay', 'souls' ],
    [ 'Inc.', 'incrementSouls', 'souls' ],
    [ 'Dec.', 'decrementSouls', 'souls' ],
    [ 'Unit', 'toggle', 'unit' ],
    [ 'Leader', 'toggleLeaderDisplay', 'unit' ],
  ];
  models_buttons = R.append([ 'Effects', 'toggle', 'effects' ], models_buttons);
  R.forEach(function(effect) {
    models_buttons = R.append([ effect[0], 'toggle'+effect[0]+'EffectDisplay', 'effects' ],
                              models_buttons);
  }, effects);
  var models_mode = {
    onEnter: function modelsOnEnter(scope) {
    },
    onLeave: function modelsOnLeave(scope) {
    },
    name: 'Models',
    actions: models_actions,
    buttons: models_buttons,
    bindings: models_bindings,
    effects: effects,
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
