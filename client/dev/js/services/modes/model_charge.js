'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

angular.module('clickApp.services').factory('modelChargeMode', ['modes', 'settings', 'modelsMode', 'modelBaseMode', 'model', 'game', 'gameModels', 'gameModelSelection', function modelChargeModeServiceFactory(modesService, settingsService, modelsModeService, modelBaseModeService, modelService, gameService, gameModelsService, gameModelSelectionService) {
  var charge_actions = Object.create(modelBaseModeService.actions);
  charge_actions.endCharge = function (state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return R.pipePromise(function () {
      return state.event('Game.command.execute', 'onModels', ['endCharge', [], stamps]);
    }, function () {
      return state.event('Modes.switchTo', 'Model');
    })();
  };
  charge_actions.setTargetModel = function (state, event) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), function (model) {
      return R.pipeP(function () {
        return modelService.chargeTarget(model).catch(R.always(null));
      }, function (target_stamp) {
        return target_stamp === event['click#'].target.state.stamp ? null : event['click#'].target;
      }, function (set_target) {
        if (R.exists(set_target) && model.state.stamp === set_target.state.stamp) return null;

        return state.event('Game.command.execute', 'onModels', ['setChargeTarget', [state.factions, set_target], stamps]);
      })();
    })(state.game.models);
  };
  var moves = [['moveFront', 'up', 'moveFront'], ['moveBack', 'down', 'moveBack'], ['rotateLeft', 'left', 'rotateLeft'], ['rotateRight', 'right', 'rotateRight'], ['shiftUp', 'ctrl+up', 'shiftDown'], ['shiftDown', 'ctrl+down', 'shiftUp'], ['shiftLeft', 'ctrl+left', 'shiftRight'], ['shiftRight', 'ctrl+right', 'shiftLeft']];
  var buildChargeMove$ = R.curry(function (move, flip_move, small, state) {
    var stamps = gameModelSelectionService.get('local', state.game.model_selection);
    var _move = R.path(['ui_state', 'flip_map'], state) ? flip_move : move;
    return R.pipeP(gameModelsService.findStamp$(stamps[0]), function (model) {
      return modelService.chargeTarget(model).catch(R.always(null));
    }, function (target_stamp) {
      return R.exists(target_stamp) ? gameModelsService.findStamp(target_stamp, state.game.models) : null;
    }, function (target_model) {
      return state.event('Game.command.execute', 'onModels', [_move + 'Charge', [state.factions, target_model, small], stamps]);
    })(state.game.models);
  });
  R.forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 3);

    var move = _ref2[0];
    var keys = _ref2[1];
    var flip_move = _ref2[2];

    keys = keys;
    charge_actions[move] = buildChargeMove$(move, flip_move, false);
    charge_actions[move + 'Small'] = buildChargeMove$(move, flip_move, true);
  }, moves);

  var charge_default_bindings = {
    'endCharge': 'c',
    'setTargetModel': 'shift+clickModel'
  };
  var charge_bindings = R.extend(Object.create(modelBaseModeService.bindings), charge_default_bindings);
  var charge_buttons = modelsModeService.buildButtons({ single: true,
    end_charge: true
  });
  var charge_mode = {
    onEnter: function onEnter() {},
    onLeave: function onLeave() {},
    name: 'ModelCharge',
    actions: charge_actions,
    buttons: charge_buttons,
    bindings: charge_bindings
  };
  modesService.registerMode(charge_mode);
  settingsService.register('Bindings', charge_mode.name, charge_default_bindings, function (bs) {
    R.extend(charge_mode.bindings, bs);
  });
  return charge_mode;
}]);
//# sourceMappingURL=model_charge.js.map
