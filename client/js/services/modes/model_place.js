'use strict';

self.modelPlaceModeServiceFactory = function modelPlaceModeServiceFactory(modesService,
                                                                          settingsService,
                                                                          modelsModeService,
                                                                          modelBaseModeService,
                                                                          gameService,
                                                                          gameModelsService,
                                                                          gameModelSelectionService) {
  var model_actions = Object.create(modelBaseModeService.actions);
  model_actions.endPlace = function modelEndPlace(scope) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    gameService.executeCommand('onModels', 'endPlace',
                               stamps, scope, scope.game);
    modesService.switchToMode('Model', scope, scope.modes);
  };
  model_actions.clickModel = function modelClickModel(scope, event, dom_event) {
    var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
    var model = gameModelsService.findStamp(stamps[0], scope.game.models);
    if(dom_event.shiftKey &&
       model.state.stamp !== event.target.state.stamp) {
      gameService.executeCommand('onModels', 'setPlaceTarget',
                                 scope.factions, event.target,
                                 stamps, scope, scope.game);
      return;
    }
    if(dom_event.ctrlKey &&
       model.state.stamp !== event.target.state.stamp) {
      gameService.executeCommand('onModels', 'setPlaceOrigin',
                                 scope.factions, event.target,
                                 stamps, scope, scope.game);
      return;
    }
    modelBaseModeService.actions.clickModel(scope, event, dom_event);
  };
  var moves = [
    ['moveFront', 'up', 'moveFront'],
    ['moveBack', 'down', 'moveBack'],
    ['rotateLeft', 'left', 'rotateLeft'],
    ['rotateRight', 'right', 'rotateRight'],
    ['shiftUp', 'ctrl+up', 'shiftDown'],
    ['shiftDown', 'ctrl+down', 'shiftUp'],
    ['shiftLeft', 'ctrl+left', 'shiftRight'],
    ['shiftRight', 'ctrl+right', 'shiftLeft'],
  ];
  R.forEach(function(move) {
    model_actions[move[0]] = buildPlaceMove(move[0], move[2], false,
                                             move[0]);
    model_actions[move[0]+'Small'] = buildPlaceMove(move[0], move[2], true,
                                                     move[0]+'Small');
  }, moves);
  function buildPlaceMove(move, flip_move, small, fwd) {
    return function modelDoPlaceMove(scope) {
      var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
      var _move = move;
      if(R.path(['ui_state','flip_map'], scope)) _move = flip_move;

      gameService.executeCommand('onModels', _move+'Place',
                                 scope.factions, small,
                                 stamps, scope, scope.game);
    };
  }

  var model_default_bindings = {
    'endPlace': 'p',
  };
  var model_bindings = R.extend(Object.create(modelBaseModeService.bindings),
                                model_default_bindings);
  var model_buttons = modelsModeService.buildButtons({ single: true,
                                                       end_place: true });
  var model_mode = {
    onEnter: function modelOnEnter(scope) {
    },
    onLeave: function modelOnLeave(scope) {
    },
    name: 'ModelPlace',
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
