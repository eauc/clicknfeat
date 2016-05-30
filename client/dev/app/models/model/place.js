'use strict';

(function () {
  angular.module('clickApp.services').factory('modelPlace', modelPlaceModelFactory);

  modelPlaceModelFactory.$inject = ['point'];
  function modelPlaceModelFactory(pointModel) {
    var PLACE_EPSILON = 0.1;
    var STATE_LENS = R.lensProp('state');
    var PLACE_LENS = R.lensPath(['state', 'pla']);
    var PLACE_MAX_LENGTH_LENS = R.lensPath(['state', 'pml']);
    return function (MOVES, modelModel) {
      var modelPlaceModel = {
        startPlaceP: modelStartPlaceP,
        isPlacing: modelIsPlacing,
        endPlace: modelEndPlace,
        setPlaceOriginP: modelSetPlaceOriginP,
        setPlaceTargetP: modelSetPlaceTargetP,
        placeMaxLength: modelPlaceMaxLength,
        setPlaceMaxLengthP: modelSetPlaceMaxLength,
        placeWithin: modelPlaceWithin,
        setPlaceWithinP: modelSetPlaceWithin,
        moveFrontPlaceP: modelMoveFrontPlaceP,
        moveBackPlaceP: modelMoveBackPlaceP,
        rotateLeftPlaceP: modelRotateLeftPlaceP,
        rotateRightPlaceP: modelRotateRightPlaceP,
        shiftLeftPlaceP: modelShiftLeftPlaceP,
        shiftRightPlaceP: modelShiftRightPlaceP,
        shiftUpPlaceP: modelShiftUpPlaceP,
        shiftDownPlaceP: modelShiftDownPlaceP,
        renderPlace: modelRenderPlace
      };
      var ensurePlaceLength$ = R.curry(ensurePlaceLength);
      modelModel.state_checkers = R.append(ensurePlaceLength$, modelModel.state_checkers);
      var updatePlaceDirection$ = R.curry(updatePlaceDirection);
      modelModel.state_updaters = R.append(updatePlaceDirection$, modelModel.state_updaters);
      return modelPlaceModel;

      function modelStartPlaceP(model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), R.set(PLACE_LENS, { s: R.pick(['x', 'y', 'r'], model.state) }));
      }
      function modelIsPlacing(model) {
        return R.exists(R.view(PLACE_LENS, model));
      }
      function modelEndPlace(model) {
        return R.set(PLACE_LENS, null, model);
      }
      function modelSetPlaceOriginP(other, model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function () {
          var direction = pointModel.directionTo(model.state.pla.s, other.state);
          return R.thread(model)(R.over(STATE_LENS, pointModel.rotateAroundTo$(direction, model.state.pla.s)), R.assocPath(['state', 'pla', 's', 'r'], direction));
        }, modelModel.checkState$(null));
      }
      function modelSetPlaceTargetP(other, model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function () {
          var direction = pointModel.directionTo(other.state, model.state.pla.s);
          return R.thread(model)(R.over(STATE_LENS, pointModel.rotateAroundTo$(direction, model.state.pla.s)), R.assocPath(['state', 'pla', 's', 'r'], direction));
        }, modelModel.checkState$(null));
      }
      function modelPlaceMaxLength(model) {
        return R.head(R.view(PLACE_MAX_LENGTH_LENS, model));
      }
      function modelSetPlaceMaxLength(value, model) {
        model = R.set(PLACE_MAX_LENGTH_LENS, [value, R.viewOr([], PLACE_MAX_LENGTH_LENS, model)[1]], model);
        return modelModel.checkState(null, model);
      }
      function modelPlaceWithin(model) {
        return R.nth(1, R.viewOr([], PLACE_MAX_LENGTH_LENS, model));
      }
      function modelSetPlaceWithin(value, model) {
        model = R.set(PLACE_MAX_LENGTH_LENS, [R.viewOr([], PLACE_MAX_LENGTH_LENS, model)[0], value], model);
        return modelModel.checkState(null, model);
      }
      function modelMoveFrontPlaceP(small, model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function () {
          var dist = MOVES[small ? 'MoveSmall' : 'Move'];
          var direction = model.state.pla.s.r;
          return R.over(STATE_LENS, pointModel.translateInDirection$(dist, direction), model);
        }, modelModel.checkState$(null));
      }
      function modelMoveBackPlaceP(small, model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function () {
          var dist = MOVES[small ? 'MoveSmall' : 'Move'];
          var direction = model.state.pla.s.r + 180;
          var distance = pointModel.distanceTo(model.state, model.state.pla.s);
          if (dist > distance) dist = distance;
          return R.over(STATE_LENS, pointModel.translateInDirection$(dist, direction), model);
        }, modelModel.checkState$(null));
      }
      function modelRotateLeftPlaceP(small, model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function () {
          var angle = MOVES[small ? 'RotateChargeSmall' : 'RotateCharge'];
          return R.thread(model)(R.over(STATE_LENS, pointModel.rotateLeftAround$(angle, model.state.pla.s)), R.over(R.lensPath(['state', 'pla', 's', 'r']), R.subtract(R.__, angle)));
        }, modelModel.checkState$(null));
      }
      function modelRotateRightPlaceP(small, model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function () {
          var angle = MOVES[small ? 'RotateChargeSmall' : 'RotateCharge'];
          return R.thread(model)(R.over(STATE_LENS, pointModel.rotateRightAround$(angle, model.state.pla.s)), R.over(R.lensPath(['state', 'pla', 's', 'r']), R.add(angle)));
        }, modelModel.checkState$(null));
      }
      function modelShiftLeftPlaceP(small, model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function () {
          var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
          return R.over(STATE_LENS, pointModel.shiftLeft$(dist), model);
        }, modelModel.checkState$(null));
      }
      function modelShiftRightPlaceP(small, model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function () {
          var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
          return R.over(STATE_LENS, pointModel.shiftRight$(dist), model);
        }, modelModel.checkState$(null));
      }
      function modelShiftUpPlaceP(small, model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function () {
          var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
          return R.over(STATE_LENS, pointModel.shiftUp$(dist), model);
        }, modelModel.checkState$(null));
      }
      function modelShiftDownPlaceP(small, model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function () {
          var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
          return R.over(STATE_LENS, pointModel.shiftDown$(dist), model);
        }, modelModel.checkState$(null));
      }
      function ensurePlaceLength(_target_, info, state) {
        if (R.exists(state.pla) && R.exists(state.pml) && state.pml[0] > 0) {
          var distance = pointModel.distanceTo(state, state.pla.s);
          var max_dist = state.pml[0] * 10 + (state.pml[1] ? info.base_radius * 2 : 0);
          if (distance > max_dist) {
            var direction = pointModel.directionTo(state, state.pla.s);
            var position = pointModel.translateInDirection(max_dist, direction, state.pla.s);
            return R.thread(state)(R.assoc('x', position.x), R.assoc('y', position.y));
          }
        }
        return state;
      }
      function updatePlaceDirection(state) {
        if (R.exists(state.pla)) {
          var distance = pointModel.distanceTo(state, state.pla.s);
          if (distance > PLACE_EPSILON) {
            var direction = pointModel.directionTo(state, state.pla.s);
            return R.assocPath(['pla', 's', 'r'], direction, state);
          }
        }
        return state;
      }
      function modelRenderPlace(_ref, state) {
        var base = _ref.base;
        var info = _ref.info;
        var path = _ref.path;

        if (modelModel.isPlacing({ state: state })) {
          path.show = true;

          var place_dir = state.pla.s.r;
          var place_middle = pointModel.translateInDirection(400, place_dir, state.pla.s);
          path.x = place_middle.x - info.base_radius;
          path.y = place_middle.y - 400;
          path.transform = 'rotate(' + place_dir + ',' + place_middle.x + ',' + place_middle.y + ')';

          var place_length = pointModel.distanceTo(state, state.pla.s);
          var place_text = Math.round(place_length * 10) / 100 + '"';
          var within = modelModel.placeWithin({ state: state });
          var place_max_dist = modelModel.placeMaxLength({ state: state });
          if (R.exists(place_max_dist)) {
            place_text += '/' + (within ? 'w.' : '') + place_max_dist + '"';
          }
          var place_options = {
            rotate: 0,
            flip_center: state.pla.s,
            text_center: state.pla.s
          };
          var place_label = base.renderText(place_options, place_text);
          place_label.show = true;
          path.length = place_label;
        }
        return {};
      }
    };
  }
})();
//# sourceMappingURL=place.js.map
