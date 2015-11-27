'use strict';

angular.module('clickApp.services')
  .factory('modelCharge', [
    'point',
    function modelChargeServiceFactory(pointService) {
      var CHARGE_EPSILON = 0.1;
      return function(MOVES, modelService) {
        var modelChargeService = {
          startCharge: function modelStartCharge(model) {
            if(modelService.isLocked(model)) {
              return self.Promise.reject('Model is locked');
            }
            model.state = R.assoc('cha', {
              s: R.pick(['x','y','r'], model.state),
              t: null
            }, model.state);
            return model;
          },
          isCharging: function modelIsCharging(model) {
            return R.exists(model.state.cha);
          },
          chargeTarget: function modelChargeTarget(model) {
            return new self.Promise(function(resolve, reject) {
              if(!modelService.isCharging(model)) {
                reject('Model is not charging');
                return;
              }
              resolve(R.path(['state','cha','t'], model));
            });
          },
          endCharge: function modelEndCharge(model) {
            model.state = R.assoc('cha', null, model.state);
            return model;
          },
          setChargeTarget: function modelSetChargeTarget(factions, other, model) {
            if(modelService.isLocked(model)) {
              return self.Promise.reject('Model is locked');
            }
            if(R.exists(other)) {
              model.state.cha = R.assoc('t', other.state.stamp, model.state.cha);
              model.state = R.assoc('r',
                                    pointService.directionTo(other.state, model.state),
                                    model.state);
            }
            else {
              model.state.cha = R.assoc('t', null, model.state.cha);
            }
            return modelService.checkState(factions, other, model);
          },
          chargeMaxLength: function modelChargeMaxLength(model) {
            return R.path(['state','cml'], model);
          },
          setChargeMaxLength: function modelSetChargeMaxLength(factions, value, model) {
            model.state = R.assoc('cml', value, model.state);
            return modelService.checkState(factions, null, model);
          },
          moveFrontCharge: function modelMoveFrontCharge(factions, target, small, model) {
            if(modelService.isLocked(model)) {
              return self.Promise.reject('Model is locked');
            }
            var dist = MOVES[small ? 'MoveSmall' : 'Move'];
            var direction = model.state.cha.s.r;
            var distance = pointService.distanceTo(model.state, model.state.cha.s);
            model.state = pointService.translateInDirection(dist, direction, model.state);
            return modelService.checkState(factions, target, model);
          },
          moveBackCharge: function modelMoveBackCharge(factions, target, small, model) {
            if(modelService.isLocked(model)) {
              return self.Promise.reject('Model is locked');
            }
            var dist = MOVES[small ? 'MoveSmall' : 'Move'];
            var direction = model.state.cha.s.r+180;
            var distance = pointService.distanceTo(model.state, model.state.cha.s);
            if(dist > distance) dist = distance;
            model.state = pointService.translateInDirection(dist, direction, model.state);
            return modelService.checkState(factions, target, model);
          },
          rotateLeftCharge: function modelRotateLeftCharge(factions, target, small, model) {
            if(modelService.isLocked(model)) {
              return self.Promise.reject('Model is locked');
            }
            var angle = MOVES[small ? 'RotateChargeSmall' : 'RotateCharge'];
            model.state = R.pipe(
              pointService.rotateLeftAround$(angle, model.state.cha.s),
              R.assocPath(['cha','s','r'], model.state.cha.s.r-angle)
            )(model.state);
            return modelService.checkState(factions, target, model);
          },
          rotateRightCharge: function modelRotateRightCharge(factions, target, small, model) {
            if(modelService.isLocked(model)) {
              return self.Promise.reject('Model is locked');
            }
            var angle = MOVES[small ? 'RotateChargeSmall' : 'RotateCharge'];
            model.state = R.pipe( 
              pointService.rotateRightAround$(angle, model.state.cha.s),
              R.assocPath(['cha','s','r'], model.state.cha.s.r+angle)
            )(model.state);
            return modelService.checkState(factions, target, model);
          },
          shiftLeftCharge: function modelShiftLeftCharge(factions, target, small, model) {
            if(modelService.isLocked(model)) {
              return self.Promise.reject('Model is locked');
            }
            var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
            model.state = pointService.shiftLeft(dist, model.state);
            return modelService.checkState(factions, target, model);
          },
          shiftRightCharge: function modelShiftRightCharge(factions, target, small, model) {
            if(modelService.isLocked(model)) {
              return self.Promise.reject('Model is locked');
            }
            var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
            model.state = pointService.shiftRight(dist, model.state);
            return modelService.checkState(factions, target, model);
          },
          shiftUpCharge: function modelShiftUpCharge(factions, target, small, model) {
            if(modelService.isLocked(model)) {
              return self.Promise.reject('Model is locked');
            }
            var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
            model.state = pointService.shiftUp(dist, model.state);
            return modelService.checkState(factions, target, model);
          },
          shiftDownCharge: function modelShiftDownCharge(factions, target, small, model) {
            if(modelService.isLocked(model)) {
              return self.Promise.reject('Model is locked');
            }
            var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
            model.state = pointService.shiftDown(dist, model.state);
            return modelService.checkState(factions, target, model);
          },
        };
        var ensureChargeLength = R.curry(function _ensureChargeLength(info, target, state) {
          if(R.exists(state.cha) &&
             R.exists(state.cml) &&
             state.cml > 0) {
            var distance = pointService.distanceTo(state, state.cha.s);
            if(distance > state.cml*10) {
              var direction = pointService.directionTo(state, state.cha.s);
              var position = pointService.translateInDirection(state.cml*10, direction,
                                                               state.cha.s);
              return R.pipe(
                R.assoc('x', position.x),
                R.assoc('y', position.y)
              )(state);
            }
          }
          return state;
        });
        modelService.state_checkers = R.append(ensureChargeLength, modelService.state_checkers);
        var ensureChargeOrientation = R.curry(function _ensureChargeOrientation(info, target, state) {
          if(R.exists(state.cha)) {
            if(R.exists(target)) {
              return R.assoc('r', pointService.directionTo(target.state, state), state);
            }
            var distance = pointService.distanceTo(state, state.cha.s);
            var direction = CHARGE_EPSILON > distance ? state.r :
                pointService.directionTo(state, state.cha.s);
            return R.assoc('r', direction, state);
          }
          return state;
        });
        modelService.state_checkers = R.append(ensureChargeOrientation, modelService.state_checkers);
        
        var updateChargeDirection = R.curry(function _updateChargeDirection(state) {
          if(R.exists(state.cha)) {
            var distance = pointService.distanceTo(state, state.cha.s);
            if(distance > CHARGE_EPSILON) {
              var direction = pointService.directionTo(state, state.cha.s);
              return R.assocPath(['cha','s','r'], direction, state);
            }
          }
          return state;
        });
        modelService.state_updaters = R.append(updateChargeDirection, modelService.state_updaters);

        return modelChargeService;
      };
    }
  ]);
