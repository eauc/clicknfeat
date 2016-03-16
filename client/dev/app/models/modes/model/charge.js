'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.services').factory('modelChargeMode', modelChargeModeModelFactory);

  modelChargeModeModelFactory.$inject = ['modes', 'settings', 'modelsMode', 'modelBaseMode', 'model', 'gameModels', 'gameModelSelection'];
  function modelChargeModeModelFactory(modesModel, settingsModel, modelsModeModel, modelBaseModeModel, modelModel, gameModelsModel, gameModelSelectionModel) {
    var charge_actions = Object.create(modelBaseModeModel.actions);
    charge_actions.endCharge = chargeModelEnd;
    charge_actions.setTargetModel = chargeModelSetTarget;
    var moves = [['moveFront', 'up', 'moveFront'], ['moveBack', 'down', 'moveBack'], ['rotateLeft', 'left', 'rotateLeft'], ['rotateRight', 'right', 'rotateRight'], ['shiftUp', 'ctrl+up', 'shiftDown'], ['shiftDown', 'ctrl+down', 'shiftUp'], ['shiftLeft', 'ctrl+left', 'shiftRight'], ['shiftRight', 'ctrl+right', 'shiftLeft']];
    var chargeModelMove$ = R.curry(chargeModelMove);
    R.forEach(buildChargeMove, moves);

    var charge_default_bindings = {
      'endCharge': 'c',
      'setTargetModel': 'shift+clickModel'
    };
    var charge_bindings = R.extend(Object.create(modelBaseModeModel.bindings), charge_default_bindings);
    var charge_buttons = modelsModeModel.buildButtons({ single: true,
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
    modesModel.registerMode(charge_mode);
    settingsModel.register('Bindings', charge_mode.name, charge_default_bindings, function (bs) {
      R.extend(charge_mode.bindings, bs);
    });
    return charge_mode;

    function chargeModelEnd(state) {
      var stamps = gameModelSelectionModel.get('local', state.game.model_selection);
      return R.threadP()(function () {
        return state.eventP('Game.command.execute', 'onModels', ['endCharge', [], stamps]);
      }, function () {
        return state.eventP('Modes.switchTo', 'Model');
      });
    }
    function chargeModelSetTarget(state, event) {
      var stamps = gameModelSelectionModel.get('local', state.game.model_selection);
      return R.threadP(state.game)(R.prop('models'), gameModelsModel.findStampP$(stamps[0]), function (model) {
        return R.threadP()(function () {
          return modelModel.chargeTargetP(model).catch(R.always(null));
        }, function (target_stamp) {
          return target_stamp === event['click#'].target.state.stamp ? null : event['click#'].target;
        }, function (set_target) {
          if (R.exists(set_target) && model.state.stamp === set_target.state.stamp) return null;

          return state.eventP('Game.command.execute', 'onModels', ['setChargeTargetP', [state.factions, set_target], stamps]);
        });
      });
    }
    function chargeModelMove(move, flip_move, small, state) {
      var stamps = gameModelSelectionModel.get('local', state.game.model_selection);
      var _move = R.path(['ui_state', 'flip_map'], state) ? flip_move : move;
      return R.threadP(state.game)(R.prop('models'), gameModelsModel.findStampP$(stamps[0]), function (model) {
        return modelModel.chargeTargetP(model).catch(R.always(null));
      }, function (target_stamp) {
        return R.exists(target_stamp) ? gameModelsModel.findStampP(target_stamp, state.game.models) : null;
      }, function (target_model) {
        return state.eventP('Game.command.execute', 'onModels', [_move + 'ChargeP', [state.factions, target_model, small], stamps]);
      });
    }
    function buildChargeMove(_ref) {
      var _ref2 = _slicedToArray(_ref, 3);

      var move = _ref2[0];
      var _keys_ = _ref2[1];
      var flip_move = _ref2[2];

      charge_actions[move] = chargeModelMove$(move, flip_move, false);
      charge_actions[move + 'Small'] = chargeModelMove$(move, flip_move, true);
    }
  }
})();
//# sourceMappingURL=charge.js.map
