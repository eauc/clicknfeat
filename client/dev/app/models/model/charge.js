'use strict';

(function () {
  angular.module('clickApp.services').factory('modelCharge', modelChargeModelFactory);

  modelChargeModelFactory.$inject = ['point'];
  function modelChargeModelFactory(pointModel) {
    var CHARGE_EPSILON = 0.1;
    var STATE_LENS = R.lensProp('state');
    var CHARGE_LENS = R.lensPath(['state', 'cha']);
    var CHARGE_TARGET_LENS = R.lensPath(['state', 'cha', 't']);
    var CHARGE_MAX_LENGTH_LENS = R.lensPath(['state', 'cml']);
    return function (MOVES, modelModel) {
      var modelChargeModel = {
        startChargeP: modelStartChargeP,
        isCharging: modelIsCharging,
        chargeTarget: modelChargeTarget,
        endCharge: modelEndCharge,
        setChargeTargetP: modelSetChargeTargetP,
        chargeMaxLength: modelChargeMaxLength,
        setChargeMaxLength: modelSetChargeMaxLength,
        moveFrontChargeP: modelMoveFrontChargeP,
        moveBackChargeP: modelMoveBackChargeP,
        rotateLeftChargeP: modelRotateLeftChargeP,
        rotateRightChargeP: modelRotateRightChargeP,
        shiftLeftChargeP: modelShiftLeftChargeP,
        shiftRightChargeP: modelShiftRightChargeP,
        shiftUpChargeP: modelShiftUpChargeP,
        shiftDownChargeP: modelShiftDownChargeP,
        renderCharge: modelRenderCharge
      };
      var ensureChargeLength$ = R.curry(ensureChargeLength);
      modelModel.state_checkers = R.append(ensureChargeLength$, modelModel.state_checkers);
      var ensureChargeOrientation$ = R.curry(ensureChargeOrientation);
      modelModel.state_checkers = R.append(ensureChargeOrientation$, modelModel.state_checkers);
      var updateChargeDirection$ = R.curry(updateChargeDirection);
      modelModel.state_updaters = R.append(updateChargeDirection$, modelModel.state_updaters);

      return modelChargeModel;

      function modelStartChargeP(model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), R.set(CHARGE_LENS, {
          s: R.pick(['x', 'y', 'r'], model.state),
          t: null
        }));
      }
      function modelIsCharging(model) {
        return R.exists(R.view(CHARGE_LENS, model));
      }
      function modelChargeTarget(model) {
        return R.view(CHARGE_TARGET_LENS, model);
      }
      function modelEndCharge(model) {
        return R.set(CHARGE_LENS, null, model);
      }
      function modelSetChargeTargetP(factions, other, model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function (model) {
          if (R.exists(other)) {
            return R.thread(model)(R.over(CHARGE_LENS, R.assoc('t', other.state.stamp)), R.over(STATE_LENS, R.assoc('r', pointModel.directionTo(other.state, model.state))));
          } else {
            return R.set(CHARGE_TARGET_LENS, null, model);
          }
        }, modelModel.checkState$(factions, other));
      }
      function modelChargeMaxLength(model) {
        return R.view(CHARGE_MAX_LENGTH_LENS, model);
      }
      function modelSetChargeMaxLength(factions, value, model) {
        model = R.set(CHARGE_MAX_LENGTH_LENS, value, model);
        return modelModel.checkState(factions, null, model);
      }
      function modelMoveFrontChargeP(factions, target, small, model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function (model) {
          var dist = MOVES[small ? 'MoveSmall' : 'Move'];
          var direction = model.state.cha.s.r;
          return R.over(STATE_LENS, pointModel.translateInDirection$(dist, direction), model);
        }, modelModel.checkState$(factions, target));
      }
      function modelMoveBackChargeP(factions, target, small, model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function (model) {
          var dist = MOVES[small ? 'MoveSmall' : 'Move'];
          var direction = model.state.cha.s.r + 180;
          var distance = pointModel.distanceTo(model.state, model.state.cha.s);
          if (dist > distance) dist = distance;
          return R.over(STATE_LENS, pointModel.translateInDirection$(dist, direction), model);
        }, modelModel.checkState$(factions, target));
      }
      function modelRotateLeftChargeP(factions, target, small, model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function (model) {
          var angle = MOVES[small ? 'RotateChargeSmall' : 'RotateCharge'];
          return R.thread(model)(R.over(STATE_LENS, pointModel.rotateLeftAround$(angle, model.state.cha.s)), R.over(R.lensPath(['state', 'cha', 's', 'r']), R.subtract(R.__, angle)));
        }, modelModel.checkState$(factions, target));
      }
      function modelRotateRightChargeP(factions, target, small, model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function (model) {
          var angle = MOVES[small ? 'RotateChargeSmall' : 'RotateCharge'];
          return R.thread(model)(R.over(STATE_LENS, pointModel.rotateRightAround$(angle, model.state.cha.s)), R.over(R.lensPath(['state', 'cha', 's', 'r']), R.add(angle)));
        }, modelModel.checkState$(factions, target));
      }
      function modelShiftLeftChargeP(factions, target, small, model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function (model) {
          var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
          return R.over(STATE_LENS, pointModel.shiftLeft$(dist), model);
        }, modelModel.checkState$(factions, target));
      }
      function modelShiftRightChargeP(factions, target, small, model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function (model) {
          var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
          return R.over(STATE_LENS, pointModel.shiftRight$(dist), model);
        }, modelModel.checkState$(factions, target));
      }
      function modelShiftUpChargeP(factions, target, small, model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function (model) {
          var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
          return R.over(STATE_LENS, pointModel.shiftUp$(dist), model);
        }, modelModel.checkState$(factions, target));
      }
      function modelShiftDownChargeP(factions, target, small, model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function (model) {
          var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
          return R.over(STATE_LENS, pointModel.shiftDown$(dist), model);
        }, modelModel.checkState$(factions, target));
      }
      function ensureChargeLength(_info_, _target_, state) {
        if (R.exists(state.cha) && R.exists(state.cml) && state.cml > 0) {
          var distance = pointModel.distanceTo(state, state.cha.s);
          if (distance > state.cml * 10) {
            var direction = pointModel.directionTo(state, state.cha.s);
            var position = pointModel.translateInDirection(state.cml * 10, direction, state.cha.s);
            return R.thread(state)(R.assoc('x', position.x), R.assoc('y', position.y));
          }
        }
        return state;
      }
      function ensureChargeOrientation(_info_, target, state) {
        if (R.exists(state.cha)) {
          if (R.exists(target)) {
            return R.assoc('r', pointModel.directionTo(target.state, state), state);
          }
          var distance = pointModel.distanceTo(state, state.cha.s);
          var direction = CHARGE_EPSILON > distance ? state.r : pointModel.directionTo(state, state.cha.s);
          return R.assoc('r', direction, state);
        }
        return state;
      }
      function updateChargeDirection(state) {
        if (R.exists(state.cha)) {
          var distance = pointModel.distanceTo(state, state.cha.s);
          if (distance > CHARGE_EPSILON) {
            var direction = pointModel.directionTo(state, state.cha.s);
            return R.assocPath(['cha', 's', 'r'], direction, state);
          }
        }
        return state;
      }
      function modelRenderCharge(_ref, path, state) {
        var base = _ref.base;
        var charge_target = _ref.charge_target;
        var radius = _ref.radius;

        var charge_target_ = {};
        if (modelModel.isCharging({ state: state })) {
          path.show = true;

          var charge_dir = state.cha.s.r;
          var charge_middle = pointModel.translateInDirection(400, charge_dir, state.cha.s);
          path.x = charge_middle.x - radius;
          path.y = charge_middle.y - 400;
          path.transform = 'rotate(' + charge_dir + ',' + charge_middle.x + ',' + charge_middle.y + ')';

          var charge_length = pointModel.distanceTo(state, state.cha.s);
          var charge_text = Math.round(charge_length * 10) / 100 + '"';
          var charge_max_dist = modelModel.chargeMaxLength({ state: state });
          if (R.exists(charge_max_dist)) {
            charge_text += '/' + charge_max_dist + '"';
          }
          var charge_options = {
            rotate: 0,
            flip_center: state.cha.s,
            text_center: state.cha.s
          };
          var charge_label = base.renderText(charge_options, charge_text);
          charge_label.show = true;
          path.length = charge_label;

          if (charge_target) {
            charge_target_.show = true;
            charge_target_.cx = charge_target.state.x;
            charge_target_.cy = charge_target.state.y;
            charge_target_.radius = charge_target.info.base_radius;

            var melee_range = 0;
            if (modelModel.isMeleeDisplayed('mm', { state: state })) {
              melee_range = 5;
            }
            if (modelModel.isMeleeDisplayed('mr', { state: state })) {
              melee_range = 20;
            }
            if (modelModel.isMeleeDisplayed('ms', { state: state })) {
              melee_range = 40;
            }
            var distance_to_target = pointModel.distanceTo(charge_target.state, state);
            charge_target_.reached = distance_to_target <= melee_range + radius + charge_target.info.base_radius;
          }
        }
        return { charge_target: charge_target_ };
      }
    };
  }
})();
//# sourceMappingURL=charge.js.map
