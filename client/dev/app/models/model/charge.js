'use strict';

(function () {
  angular.module('clickApp.services').factory('modelCharge', modelChargeModelFactory);

  modelChargeModelFactory.$inject = ['point'];
  function modelChargeModelFactory(pointModel) {
    var CHARGE_EPSILON = 0.1;
    return function (MOVES, modelModel) {
      var modelChargeModel = {
        startChargeP: modelStartChargeP,
        isCharging: modelIsCharging,
        chargeTargetP: modelChargeTargetP,
        endCharge: modelEndCharge,
        setChargeTargetP: modelSetChargeTargetP,
        chargeMaxLength: modelChargeMaxLength,
        setChargeMaxLengthP: modelSetChargeMaxLengthP,
        moveFrontChargeP: modelMoveFrontChargeP,
        moveBackChargeP: modelMoveBackChargeP,
        rotateLeftChargeP: modelRotateLeftChargeP,
        rotateRightChargeP: modelRotateRightChargeP,
        shiftLeftChargeP: modelShiftLeftChargeP,
        shiftRightChargeP: modelShiftRightChargeP,
        shiftUpChargeP: modelShiftUpChargeP,
        shiftDownChargeP: modelShiftDownChargeP
      };
      var ensureChargeLength$ = R.curry(ensureChargeLength);
      modelModel.state_checkers = R.append(ensureChargeLength$, modelModel.state_checkers);
      var ensureChargeOrientation$ = R.curry(ensureChargeOrientation);
      modelModel.state_checkers = R.append(ensureChargeOrientation$, modelModel.state_checkers);
      var updateChargeDirection$ = R.curry(updateChargeDirection);
      modelModel.state_updaters = R.append(updateChargeDirection$, modelModel.state_updaters);

      return modelChargeModel;

      function modelStartChargeP(model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), R.assocPath(['state', 'cha'], {
          s: R.pick(['x', 'y', 'r'], model.state),
          t: null
        }));
      }
      function modelIsCharging(model) {
        return R.exists(model.state.cha);
      }
      function modelChargeTargetP(model) {
        return new self.Promise(function (resolve, reject) {
          if (!modelModel.isCharging(model)) {
            reject('Model is not charging');
            return;
          }
          resolve(R.path(['state', 'cha', 't'], model));
        });
      }
      function modelEndCharge(model) {
        return R.assocPath(['state', 'cha'], null, model);
      }
      function modelSetChargeTargetP(factions, other, model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function (model) {
          if (R.exists(other)) {
            return R.thread(model)(R.over(R.lensPath(['state', 'cha']), R.assoc('t', other.state.stamp)), R.over(R.lensProp('state'), R.assoc('r', pointModel.directionTo(other.state, model.state))));
          } else {
            return R.assocPath(['state', 'cha', 't'], null, model);
          }
        }, modelModel.checkStateP$(factions, other));
      }
      function modelChargeMaxLength(model) {
        return R.path(['state', 'cml'], model);
      }
      function modelSetChargeMaxLengthP(factions, value, model) {
        model = R.assocPath(['state', 'cml'], value, model);
        return modelModel.checkStateP(factions, null, model);
      }
      function modelMoveFrontChargeP(factions, target, small, model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function (model) {
          var dist = MOVES[small ? 'MoveSmall' : 'Move'];
          var direction = model.state.cha.s.r;
          return R.over(R.lensProp('state'), pointModel.translateInDirection$(dist, direction), model);
        }, modelModel.checkStateP$(factions, target));
      }
      function modelMoveBackChargeP(factions, target, small, model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function (model) {
          var dist = MOVES[small ? 'MoveSmall' : 'Move'];
          var direction = model.state.cha.s.r + 180;
          var distance = pointModel.distanceTo(model.state, model.state.cha.s);
          if (dist > distance) dist = distance;
          return R.over(R.lensProp('state'), pointModel.translateInDirection$(dist, direction), model);
        }, modelModel.checkStateP$(factions, target));
      }
      function modelRotateLeftChargeP(factions, target, small, model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function (model) {
          var angle = MOVES[small ? 'RotateChargeSmall' : 'RotateCharge'];
          return R.thread(model)(R.over(R.lensProp('state'), pointModel.rotateLeftAround$(angle, model.state.cha.s)), R.over(R.lensPath(['state', 'cha', 's', 'r']), R.subtract(R.__, angle)));
        }, modelModel.checkStateP$(factions, target));
      }
      function modelRotateRightChargeP(factions, target, small, model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function (model) {
          var angle = MOVES[small ? 'RotateChargeSmall' : 'RotateCharge'];
          return R.thread(model)(R.over(R.lensProp('state'), pointModel.rotateRightAround$(angle, model.state.cha.s)), R.over(R.lensPath(['state', 'cha', 's', 'r']), R.add(angle)));
        }, modelModel.checkStateP$(factions, target));
      }
      function modelShiftLeftChargeP(factions, target, small, model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function (model) {
          var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
          return R.over(R.lensProp('state'), pointModel.shiftLeft$(dist), model);
        }, modelModel.checkStateP$(factions, target));
      }
      function modelShiftRightChargeP(factions, target, small, model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function (model) {
          var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
          return R.over(R.lensProp('state'), pointModel.shiftRight$(dist), model);
        }, modelModel.checkStateP$(factions, target));
      }
      function modelShiftUpChargeP(factions, target, small, model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function (model) {
          var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
          return R.over(R.lensProp('state'), pointModel.shiftUp$(dist), model);
        }, modelModel.checkStateP$(factions, target));
      }
      function modelShiftDownChargeP(factions, target, small, model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function (model) {
          var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
          return R.over(R.lensProp('state'), pointModel.shiftDown$(dist), model);
        }, modelModel.checkStateP$(factions, target));
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
    };
  }
})();
//# sourceMappingURL=charge.js.map
