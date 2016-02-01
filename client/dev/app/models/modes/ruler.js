'use strict';

angular.module('clickApp.services').factory('rulerMode', ['modes', 'settings', 'commonMode', 'game', 'gameRuler', 'model', 'gameModels', 'gameModelSelection', 'prompt', function rulerModeServiceFactory(modesService, settingsService, commonModeService, gameService, gameRulerService, modelService, gameModelsService, gameModelSelectionService, promptService) {
  var ruler_actions = Object.create(commonModeService.actions);
  ruler_actions.exitRulerMode = commonModeService.actions.modeBackToDefault;
  ruler_actions.dragStartMap = function (state, drag) {
    return state.event('Game.update', R.lensProp('ruler'), gameRulerService.setLocal$(drag.start, drag.now, state));
  };
  ruler_actions.dragMap = function (state, drag) {
    return state.event('Game.update', R.lensProp('ruler'), gameRulerService.setLocal$(drag.start, drag.now, state));
  };
  ruler_actions.dragEndMap = function (state, drag) {
    return state.event('Game.command.execute', 'setRuler', ['setRemote', [drag.start, drag.now]]);
  };
  ruler_actions.dragStartTemplate = ruler_actions.dragStartMap;
  ruler_actions.dragTemplate = ruler_actions.dragMap;
  ruler_actions.dragEndTemplate = ruler_actions.dragEndMap;
  ruler_actions.dragStartModel = ruler_actions.dragStartMap;
  ruler_actions.dragModel = ruler_actions.dragMap;
  ruler_actions.dragEndModel = ruler_actions.dragEndMap;
  ruler_actions.setOriginModel = function (state, event) {
    return R.pipePromise(function () {
      return state.event('Game.command.execute', 'setRuler', ['setOrigin', [event['click#'].target]]);
    }, function (result) {
      updateMaxLengthButton(state);
      return result;
    })();
  };
  ruler_actions.setTargetModel = function (state, event) {
    return state.event('Game.command.execute', 'setRuler', ['setTarget', [event['click#'].target]]);
  };
  ruler_actions.setMaxLength = function (state) {
    return R.pipeP(function () {
      return promptService.prompt('prompt', 'Set ruler max length :', gameRulerService.maxLength(state.game.ruler)).catch(R.always(null));
    }, function (value) {
      value = value === 0 ? null : value;
      return R.pipePromise(function () {
        return state.event('Game.command.execute', 'setRuler', ['setMaxLength', [value]]);
      }, function (result) {
        var origin = gameRulerService.origin(state.game.ruler);
        if (R.isNil(origin)) return result;

        return state.event('Game.command.execute', 'onModels', ['setRulerMaxLength', [value], [origin]]);
      })();
    }, function (result) {
      updateMaxLengthButton(state);
      return result;
    })();
  };
  ruler_actions.createAoEOnTarget = function (state) {
    return R.pipeP(function () {
      return gameRulerService.targetAoEPosition(state.game.models, state.game.ruler);
    }, function (position) {
      position.type = 'aoe';
      var create = {
        base: { x: 0, y: 0, r: 0 },
        templates: [position]
      };
      return state.event('Game.command.execute', 'createTemplate', [create, false]);
    })();
  };
  var ruler_default_bindings = {
    exitRulerMode: 'ctrl+r',
    setMaxLength: 'shift+r',
    setOriginModel: 'ctrl+clickModel',
    setTargetModel: 'shift+clickModel',
    createAoEOnTarget: 'ctrl+a'
  };
  var ruler_bindings = R.extend(Object.create(commonModeService.bindings), ruler_default_bindings);
  var ruler_buttons = [['Set Max Len.', 'setMaxLength'], ['AoE on Target', 'createAoEOnTarget']];
  var ruler_mode = {
    onEnter: function onEnter(state) {
      return R.pipePromise(function () {
        return gameModelSelectionService.get('local', state.game.model_selection);
      }, function (stamps) {
        if (R.length(stamps) !== 1) return null;

        return gameModelsService.findStamp(stamps[0], state.game.models).catch(R.always(null));
      }, function (model) {
        if (R.isNil(model)) return null;

        return state.event('Game.command.execute', 'setRuler', ['setOriginResetTarget', [model]]);
      }, function () {
        updateMaxLengthButton(state);
      })();
    },
    onLeave: function onLeave(state) {
      state.changeEvent('Game.ruler.remote.change');
    },
    name: 'Ruler',
    actions: ruler_actions,
    buttons: ruler_buttons,
    bindings: ruler_bindings
  };
  modesService.registerMode(ruler_mode);
  settingsService.register('Bindings', ruler_mode.name, ruler_default_bindings, function (bs) {
    R.extend(ruler_mode.bindings, bs);
  });

  function updateMaxLengthButton(state) {
    var max = gameRulerService.maxLength(state.game.ruler);
    ruler_mode.buttons[0][0] = 'Set Max Len. (' + max + ')';
    state.changeEvent('Modes.buttons.update');
  }

  return ruler_mode;
}]);
//# sourceMappingURL=ruler.js.map
