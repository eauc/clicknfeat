'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.services').factory('gameLos', gameLosModelFactory);

  gameLosModelFactory.$inject = ['gameSegment', 'circle', 'gameFactions', 'gameModels'];
  function gameLosModelFactory(gameSegmentModel, circleModel, gameFactionsModel, gameModelsModel) {
    var base = gameSegmentModel('los');
    var gameLosModel = Object.create(base);
    R.deepExtend(gameLosModel, {
      create: gameLosCreate,
      toggleDisplay: gameLosToggleDisplay,
      setRemote: gameLosSetRemote,
      resetRemote: gameLosResetRemote,
      origin: gameLosOrigin,
      clearOrigin: gameLosClearOrigin,
      setOrigin: gameLosSetOrigin,
      target: gameLosTarget,
      setOriginResetTarget: gameLosSetOriginResetTarget,
      clearTarget: gameLosClearTarget,
      setTarget: gameLosSetTarget,
      toggleIgnoreModel: gameLosToggleIgnoreModel,
      updateOriginTarget: gameLosUpdateOriginTarget
    });

    var setOriginTarget$ = R.curry(setOriginTarget);

    R.curryService(gameLosModel);
    return gameLosModel;

    function gameLosCreate() {
      return R.deepExtend(base.create(), {
        computed: {}
      });
    }
    function gameLosToggleDisplay(state, game, los) {
      return R.thread(los)(base.toggleDisplay$(state, game), setOriginTarget$({}, state, game));
    }
    function gameLosSetRemote(start, end, state, game, los) {
      return R.thread(los)(base.setRemote$(start, end, state, game), setOriginTarget$({}, state, game));
    }
    function gameLosResetRemote(remote, state, game, los) {
      return R.thread(los)(base.resetRemote$(remote, state, game), setOriginTarget$({}, state, game));
    }
    function gameLosOrigin(los) {
      return R.path(['remote', 'origin'], los);
    }
    function gameLosClearOrigin(state, game, los) {
      return setOriginTarget({ origin: null,
        ignore: null,
        display: false
      }, state, game, los);
    }
    function gameLosSetOrigin(origin_model, state, game, los) {
      var origin = origin_model.state.stamp;
      var target = gameLosModel.target(los);
      target = target === origin ? null : target;
      var display = target && origin;
      return setOriginTarget({ origin: origin,
        target: target,
        ignore: null,
        display: display
      }, state, game, los);
    }
    function gameLosSetOriginResetTarget(origin_model, state, game, los) {
      var origin = origin_model.state.stamp;
      return setOriginTarget({ origin: origin,
        target: null,
        ignore: null,
        display: true
      }, state, game, los);
    }
    function gameLosTarget(los) {
      return R.path(['remote', 'target'], los);
    }
    function gameLosClearTarget(state, game, los) {
      return setOriginTarget({ target: null,
        ignore: null,
        display: false
      }, state, game, los);
    }
    function gameLosSetTarget(target_model, state, game, los) {
      var origin = gameLosModel.origin(los);
      var target = target_model.state.stamp;
      origin = origin === target ? null : origin;
      var display = target && origin;
      return setOriginTarget({ origin: origin,
        target: target,
        ignore: null,
        display: display
      }, state, game, los);
    }
    function gameLosToggleIgnoreModel(model, state, game, los) {
      var ignore = R.pathOr([], ['remote', 'ignore'], los);
      var is_ignored = R.find(R.equals(model.state.stamp), ignore);
      ignore = is_ignored ? R.reject(R.equals(model.state.stamp), ignore) : R.append(model.state.stamp, ignore);
      console.log('toggleIgnoreModel', ignore);

      return setOriginTarget({ ignore: ignore }, state, game, los);
    }
    function gameLosUpdateOriginTarget(state, game, los) {
      return setOriginTarget({}, state, game, los);
    }

    function setOriginTarget(update, state, game, los) {
      var _update$origin = update.origin;
      var origin = _update$origin === undefined ? R.path(['remote', 'origin'], los) : _update$origin;
      var _update$target = update.target;
      var target = _update$target === undefined ? R.path(['remote', 'target'], los) : _update$target;
      var _update$ignore = update.ignore;
      var ignore = _update$ignore === undefined ? R.pathOr([], ['remote', 'ignore'], los) : _update$ignore;
      var _update$display = update.display;
      var display = _update$display === undefined ? R.path(['remote', 'display'], los) : _update$display;

      los = R.thread(los)(R.assocPath(['remote', 'origin'], origin), R.assocPath(['remote', 'target'], target), R.assocPath(['remote', 'display'], display), R.assocPath(['remote', 'ignore'], R.defaultTo([], ignore)), R.assoc('computed', { envelope: null,
        darkness: [],
        shadow: [] }));

      if (los.remote.origin && los.remote.target) {
        updateEnveloppes();
      }
      state.queueChangeEventP('Game.los.remote.change');
      return los;

      function updateEnveloppes() {
        R.threadP()(function () {
          return getOriginTargetInfo(state, game, los.remote.origin, los.remote.target);
        }, function (_ref) {
          var _ref2 = _slicedToArray(_ref, 4);

          var origin_state = _ref2[0];
          var origin_info = _ref2[1];
          var target_state = _ref2[2];
          var target_info = _ref2[3];

          var origin_circle = {
            x: origin_state.x,
            y: origin_state.y,
            radius: origin_info.base_radius
          };
          var target_circle = {
            x: target_state.x,
            y: target_state.y,
            radius: target_info.base_radius
          };
          var envelope = circleModel.envelopeTo(target_circle, origin_circle);
          los.computed.envelope = envelope;

          return R.threadP()(function () {
            return computeIntervenings(state, game, los.remote.ignore, target, target_circle, origin, envelope);
          }, function (intervenings) {
            return [origin_circle, intervenings];
          });
        }, function (_ref3) {
          var _ref4 = _slicedToArray(_ref3, 2);

          var origin_circle = _ref4[0];
          var intervenings = _ref4[1];

          var darkness = computeDarkness(origin_circle, intervenings);
          los.computed.darkness = darkness;

          var shadow = computeShadow(origin_circle, intervenings);
          los.computed.shadow = shadow;

          state.queueChangeEventP('Game.los.remote.change');
        });
      }
    }
    function getOriginTargetInfo(state, game, origin, target) {
      return R.threadP()(function () {
        return [gameModelsModel.findStampP(origin, game.models), gameModelsModel.findStampP(target, game.models)];
      }, R.allP, function (_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2);

        var origin_state = _ref6[0].state;
        var target_state = _ref6[1].state;

        return R.threadP()(function () {
          return [gameFactionsModel.getModelInfoP(origin_state.info, state.factions), gameFactionsModel.getModelInfoP(target_state.info, state.factions)];
        }, R.allP, function (_ref7) {
          var _ref8 = _slicedToArray(_ref7, 2);

          var origin_info = _ref8[0];
          var target_info = _ref8[1];
          return [origin_state, origin_info, target_state, target_info];
        });
      });
    }
    function computeIntervenings(state, game, ignore, target, target_circle, origin, envelope) {
      return R.threadP(game.models)(gameModelsModel.all, R.map(getModelCircle), R.allP, R.reject(circleIsNotIntervening), R.filter(circleModel.isInEnvelope$(envelope)));

      function getModelCircle(model) {
        return R.threadP()(function () {
          return gameFactionsModel.getModelInfoP(model.state.info, state.factions);
        }, function (info) {
          return R.assoc('radius', info.base_radius, model.state);
        });
      }
      function circleIsNotIntervening(circle) {
        return target === circle.stamp || origin === circle.stamp || target_circle.radius > circle.radius || R.find(R.equals(circle.stamp), ignore);
      }
    }
    function computeDarkness(origin_circle, intervenings) {
      return R.map(function (circle) {
        return circleModel.outsideEnvelopeTo(circle, [], origin_circle);
      }, intervenings);
    }
    function computeShadow(origin_circle, intervenings) {
      return R.map(function (circle) {
        return circleModel.outsideEnvelopeTo(circle, intervenings, origin_circle);
      }, intervenings);
    }
  }
})();
//# sourceMappingURL=los.js.map
