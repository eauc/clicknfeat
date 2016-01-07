'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

angular.module('clickApp.services').factory('modelPlaceMode', ['modes', 'settings', 'modelsMode', 'modelBaseMode', 'game', 'gameModels', 'gameModelSelection', function modelPlaceModeServiceFactory(modesService, settingsService, modelsModeService, modelBaseModeService, gameService, gameModelsService, gameModelSelectionService) {
  var model_actions = Object.create(modelBaseModeService.actions);
  model_actions.endPlace = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return R.pipePromise(function () {
      return state.event('Game.command.execute', 'onModels', ['endPlace', [], stamps]);
    }, function () {
      return state.event('Modes.switchTo', 'Model');
    })();
  };
  model_actions.setTargetModel = function (state, event) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), function (model) {
      if (model.state.stamp === event['click#'].target.state.stamp) return null;

      return state.event('Game.command.execute', 'onModels', ['setPlaceTarget', [state.factions, event['click#'].target], stamps]);
    })(state.game.models);
  };
  model_actions.setOriginModel = function (state, event) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), function (model) {
      if (model.state.stamp === event['click#'].target.state.stamp) return null;

      return state.event('Game.command.execute', 'onModels', ['setPlaceOrigin', [state.factions, event['click#'].target], stamps]);
    })(state.game.models);
  };
  var moves = [['moveFront', 'up', 'moveFront'], ['moveBack', 'down', 'moveBack'], ['rotateLeft', 'left', 'rotateLeft'], ['rotateRight', 'right', 'rotateRight'], ['shiftUp', 'ctrl+up', 'shiftDown'], ['shiftDown', 'ctrl+down', 'shiftUp'], ['shiftLeft', 'ctrl+left', 'shiftRight'], ['shiftRight', 'ctrl+right', 'shiftLeft']];
  var buildPlaceMove$ = R.curry(function (move, flip_move, small, state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    var _move = R.path(['ui_state', 'flip_map'], state) ? flip_move : move;

    return state.event('Game.command.execute', 'onModels', [_move + 'Place', [state.factions, small], stamps]);
  });
  R.forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 3);

    var move = _ref2[0];
    var keys = _ref2[1];
    var flip_move = _ref2[2];

    keys = keys;
    model_actions[move] = buildPlaceMove$(move, flip_move, false);
    model_actions[move + 'Small'] = buildPlaceMove$(move, flip_move, true);
  }, moves);

  var model_default_bindings = {
    'endPlace': 'p',
    'setTargetModel': 'shift+clickModel',
    'setOriginModel': 'ctrl+clickModel'
  };
  var model_bindings = R.extend(Object.create(modelBaseModeService.bindings), model_default_bindings);
  var model_buttons = modelsModeService.buildButtons({ single: true,
    end_place: true
  });
  var model_mode = {
    onEnter: function onEnter() {},
    onLeave: function onLeave() {},
    name: 'ModelPlace',
    actions: model_actions,
    buttons: model_buttons,
    bindings: model_bindings
  };
  modesService.registerMode(model_mode);
  settingsService.register('Bindings', model_mode.name, model_default_bindings, function (bs) {
    R.extend(model_mode.bindings, bs);
  });
  return model_mode;
}]);
//# sourceMappingURL=model_place.js.map
