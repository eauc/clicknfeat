'use strict';

self.rulerModeServiceFactory = function rulerModeServiceFactory(modesService,
                                                                settingsService,
                                                                commonModeService,
                                                                gameService,
                                                                gameRulerService,
                                                                modelService,
                                                                gameModelsService,
                                                                gameModelSelectionService,
                                                                promptService) {
  var ruler_actions = Object.create(commonModeService.actions);
  ruler_actions.dragStartMap = function rulerDragStartMap(scope, drag, event) {
    scope.game.ruler = gameRulerService.setLocal(drag.start, drag.now,
                                                 scope, scope.game.ruler);
  };
  ruler_actions.dragMap = function rulerDragMap(scope, drag, event) {
    scope.game.ruler = gameRulerService.setLocal(drag.start, drag.now,
                                                 scope, scope.game.ruler);
  };
  ruler_actions.dragEndMap = function rulerDragEndMap(scope, drag, event) {
    gameService.executeCommand('setRuler', 'setRemote', drag.start, drag.now,
                               scope,  scope.game);
  };
  ruler_actions.dragStartTemplate = ruler_actions.dragStartMap;
  ruler_actions.dragTemplate = ruler_actions.dragMap;
  ruler_actions.dragEndTemplate = ruler_actions.dragEndMap;
  ruler_actions.dragStartModel = ruler_actions.dragStartMap;
  ruler_actions.dragModel = ruler_actions.dragMap;
  ruler_actions.dragEndModel = ruler_actions.dragEndMap;
  ruler_actions.clickModel = function rulerClickModel(scope, event, dom_event) {
    console.log(arguments);
    if(dom_event.ctrlKey) {
      gameService.executeCommand('setRuler', 'setOrigin', scope.game.models, event.target,
                                 scope,  scope.game);
      updateMaxLengthFromModel(event.target, scope);
    }
    else if(dom_event.shiftKey) {
      gameService.executeCommand('setRuler', 'setTarget', scope.game.models, event.target,
                                 scope,  scope.game);
    }
  };
  ruler_actions.setMaxLength = function rulerSetMaxLength(scope, event) {
    promptService.prompt('prompt',
                         'Set ruler max length :',
                         gameRulerService.maxLength(scope.game.ruler))
      .then(function(value) {
        value = (value === 0) ? null : value;
        scope.game.ruler = gameRulerService.setMaxLength(value, scope.game.ruler);
        return value;
      })
      .catch(function(error) {
        scope.game.ruler = gameRulerService.setMaxLength(null, scope.game.ruler);
        return null;
      })
      .then(function(value) {
        var origin = gameRulerService.origin(scope.game.ruler);
        if(R.isNil(origin)) return;

        gameService.executeCommand('onModels', 'setRulerMaxLength', value,
                                   [origin], scope,  scope.game);
      })
      .then(function() {
        updateMaxLengthButton(scope);
      });
  };
  ruler_actions.leaveRulerMode = function rulerLeaveRulerMode(scope, event) {
    modesService.switchToMode('Default', scope, scope.modes);
  };
  ruler_actions.createAoEOnTarget = function rulerCreateAoEOnTarget(scope, event) {
    var position = gameRulerService.targetAoEPosition(scope.game.models,
                                                      scope.game.ruler);
    position.type = 'aoe';
    gameService.executeCommand('createTemplate', position,
                               scope, scope.game);
  };
  var ruler_default_bindings = {
    leaveRulerMode: 'shift+r',
    setMaxLength: 'm',
    createAoEOnTarget: 'a',
  };
  var ruler_bindings = R.extend(Object.create(commonModeService.bindings),
                                ruler_default_bindings);
  var ruler_buttons = [
    [ 'Set Max Len.', 'setMaxLength' ],
    [ 'AoE on Target', 'createAoEOnTarget' ],
  ];
  var ruler_mode = {
    onEnter: function rulerOnEnter(scope) {
      var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
      if(R.length(stamps) !== 1) return;

      var model = gameModelsService.findStamp(stamps[0], scope.game.models);
      if(R.isNil(model)) return;

      gameService.executeCommand('setRuler', 'setOriginResetTarget', scope.game.models, model,
                                 scope,  scope.game);
      
      updateMaxLengthFromModel(model, scope);
    },
    onLeave: function rulerOnLeave(scope) {
    },
    name: 'Ruler',
    actions: ruler_actions,
    buttons: ruler_buttons,
    bindings: ruler_bindings,
  };
  modesService.registerMode(ruler_mode);
  settingsService.register('Bindings',
                           ruler_mode.name,
                           ruler_default_bindings,
                           function(bs) {
                             R.extend(ruler_mode.bindings, bs);
                           });

  function updateMaxLengthFromModel(model, scope) {
    var max_length = modelService.rulerMaxLength(model);
    if(R.exists(max_length)) {
      scope.game.ruler = gameRulerService.setMaxLength(max_length, scope.game.ruler);
      updateMaxLengthButton(scope);
    }
  }
  function updateMaxLengthButton(scope) {
    var max = gameRulerService.maxLength(scope.game.ruler);
    ruler_mode.buttons[0][0] = 'Set Max Len. ('+max+')';
    scope.gameEvent('refreshActions');
  }

  return ruler_mode;
};
