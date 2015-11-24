'use strict';

angular.module('clickApp.services')
  .factory('modelPlace', [
    'point',
    'gameFactions',
    function modelPlaceServiceFactory(pointService,
                                      gameFactionsService) {
      var PLACE_EPSILON = 0.1;
      return function(MOVES, modelService) {
        var modelPlaceService = {
          startPlace: function modelStartPlace(model) {
            if(modelService.isLocked(model)) return;
            model.state = R.assoc('pla', {
              s: R.pick(['x','y','r'], model.state)
            }, model.state);
          },
          isPlacing: function modelIsPlarging(model) {
            return R.exists(model.state.pla);
          },
          endPlace: function modelEndPlace(model) {
            model.state = R.assoc('pla', null, model.state);
          },
          setPlaceOrigin: function modelSetPlaceOrigin(factions, other, model) {
            if(modelService.isLocked(model)) return;
            var direction = pointService.directionTo(model.state.pla.s, other.state);
            model.state = R.pipe(
              pointService.rotateAroundTo$(direction, model.state.pla.s),
              R.assocPath(['pla','s','r'], direction),
              modelService.checkState$(factions, null)
            )(model.state);
          },
          setPlaceTarget: function modelSetPlaceTarget(factions, other, model) {
            if(modelService.isLocked(model)) return;
            var direction = pointService.directionTo(other.state, model.state.pla.s);
            model.state = R.pipe(
              pointService.rotateAroundTo$(direction, model.state.pla.s),
              R.assocPath(['pla','s','r'], direction),
              modelService.checkState$(factions, null)
            )(model.state);
          },
          placeMaxLength: function modelPlaceMaxLength(model) {
            return R.head(R.path(['state','pml'], model));
          },
          setPlaceMaxLength: function modelSetPlaceMaxLength(value, model) {
            model.state = R.assoc('pml', [ value, model.state.pml[1] ], model.state);
          },
          placeWithin: function modelPlaceWithin(model) {
            return R.nth(1, R.defaultTo([], R.path(['state','pml'], model)));
          },
          setPlaceWithin: function modelSetPlaceWithin(value, model) {
            model.state = R.assoc('pml', [ model.state.pml[0], value ], model.state);
          },
          moveFrontPlace: function modelMoveFrontPlace(factions, small, model) {
            if(modelService.isLocked(model)) return;
            var dist = MOVES[small ? 'MoveSmall' : 'Move'];
            var direction = model.state.pla.s.r;
            var distance = pointService.distanceTo(model.state, model.state.pla.s);
            model.state = R.pipe(
              pointService.translateInDirection$(dist, direction), 
              modelService.checkState$(factions, null)
            )(model.state);
          },
          moveBackPlace: function modelMoveBackPlace(factions, small, model) {
            if(modelService.isLocked(model)) return;
            var dist = MOVES[small ? 'MoveSmall' : 'Move'];
            var direction = model.state.pla.s.r+180;
            var distance = pointService.distanceTo(model.state, model.state.pla.s);
            if(dist > distance) dist = distance;
            model.state = R.pipe(
              pointService.translateInDirection$(dist, direction),
              modelService.checkState$(factions, null)
            )(model.state);
          },
          rotateLeftPlace: function modelRotateLeftPlace(factions, small, model) {
            if(modelService.isLocked(model)) return;
            var angle = MOVES[small ? 'RotateChargeSmall' : 'RotateCharge'];
            model.state = R.pipe(
              pointService.rotateLeftAround$(angle, model.state.pla.s),
              R.assocPath(['pla','s','r'], model.state.pla.s.r - angle),
              modelService.checkState$(factions, null)
            )(model.state);
          },
          rotateRightPlace: function modelRotateRightPlace(factions, small, model) {
            if(modelService.isLocked(model)) return;
            var angle = MOVES[small ? 'RotateChargeSmall' : 'RotateCharge'];
            model.state = R.pipe( 
              pointService.rotateRightAround$(angle, model.state.pla.s),
              R.assocPath(['pla','s','r'], model.state.pla.s.r + angle),
              modelService.checkState$(factions, null)
            )(model.state);
          },
          shiftLeftPlace: function modelShiftLeftPlace(factions, small, model) {
            if(modelService.isLocked(model)) return;
            var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
            model.state = R.pipe(
              pointService.shiftLeft$(dist),
              modelService.checkState$(factions, null)
            )(model.state);
          },
          shiftRightPlace: function modelShiftRightPlace(factions, small, model) {
            if(modelService.isLocked(model)) return;
            var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
            model.state = R.pipe(
              pointService.shiftRight$(dist),
              modelService.checkState$(factions, null)
            )(model.state);
          },
          shiftUpPlace: function modelShiftUpPlace(factions, small, model) {
            if(modelService.isLocked(model)) return;
            var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
            model.state = R.pipe(
              pointService.shiftUp$(dist),
              modelService.checkState$(factions, null)
            )(model.state);
          },
          shiftDownPlace: function modelShiftDownPlace(factions, small, model) {
            if(modelService.isLocked(model)) return;
            var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
            model.state = R.pipe(
              pointService.shiftDown$(dist),
              modelService.checkState$(factions, null)
            )(model.state);
          },
        };
        var ensurePlaceLength = R.curry(function _ensurePlaceLength(info, target, state) {
          if(R.exists(state.pla) &&
             R.exists(state.pml) &&
             state.pml > 0) {
            var distance = pointService.distanceTo(state, state.pla.s);
            var max_dist = state.pml[0] * 10 + (state.pml[1] ? info.base_radius * 2 : 0);
            if(distance > max_dist) {
              var direction = pointService.directionTo(state, state.pla.s);
              var position = pointService.translateInDirection(max_dist, direction,
                                                               state.pla.s);
              return R.pipe(
                R.assoc('x', position.x),
                R.assoc('y', position.y)
              )(state);
            }
          }
          return state;
        });
        modelService.state_checkers = R.append(ensurePlaceLength, modelService.state_checkers);
        
        var updatePlaceDirection = R.curry(function _updatePlaceDirection(state) {
          if(R.exists(state.pla)) {
            var distance = pointService.distanceTo(state, state.pla.s);
            if(distance > PLACE_EPSILON) {
              var direction = pointService.directionTo(state, state.pla.s);
              return R.assocPath(['pla','s','r'], direction, state);
            }
          }
          return state;
        });
        modelService.state_updaters = R.append(updatePlaceDirection, modelService.state_updaters);

        return modelPlaceService;
      };
    }
  ]);
