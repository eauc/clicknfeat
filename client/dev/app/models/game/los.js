'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

angular.module('clickApp.services').factory('gameLos', ['point', 'circle', 'gameFactions', 'gameModels', function gameLosServiceFactory(pointService, circleService, gameFactionsService, gameModelsService) {
  var gameLosService = {
    create: function gameLosCreate() {
      return {
        local: {
          display: false,
          start: { x: 0, y: 0 },
          end: { x: 0, y: 0 }
        },
        remote: {
          display: false,
          start: { x: 0, y: 0 },
          end: { x: 0, y: 0 }
        },
        computed: {}
      };
    },
    isDisplayed: function gameLosIsDisplayed(los) {
      return R.path(['remote', 'display'], los);
    },
    origin: function gameLosOrigin(los) {
      return R.path(['remote', 'origin'], los);
    },
    clearOrigin: function gameLosClearOrigin(state, game, los) {
      return setOriginTarget(null, los.remote.target, null, false, state, game, los);
    },
    setOrigin: function gameLosSetOrigin(origin_model, state, game, los) {
      var origin = origin_model.state.stamp;
      var target = gameLosService.target(los);
      target = target === origin ? null : target;
      var display = target && origin;
      return setOriginTarget(origin, target, null, display, state, game, los);
    },
    setOriginResetTarget: function gameLosSetOriginResetTarget(origin_model, state, game, los) {
      var origin = origin_model.state.stamp;
      return setOriginTarget(origin, null, null, false, state, game, los);
    },
    target: function gameLosTarget(los) {
      return R.path(['remote', 'target'], los);
    },
    clearTarget: function gameLosClearTarget(state, game, los) {
      return setOriginTarget(los.remote.origin, null, null, false, state, game, los);
    },
    setTarget: function gameLosSetTarget(target_model, state, game, los) {
      var origin = gameLosService.origin(los);
      var target = target_model.state.stamp;
      origin = origin === target ? null : origin;
      var display = target && origin;
      return setOriginTarget(origin, target, null, display, state, game, los);
    },
    toggleIgnoreModel: function toggleIgnoreModel(model, state, game, los) {
      var ignore = R.pathOr([], ['remote', 'ignore'], los);
      var is_ignored = R.find(R.equals(model.state.stamp), ignore);
      ignore = is_ignored ? R.reject(R.equals(model.state.stamp), ignore) : R.append(model.state.stamp, ignore);
      console.log('toggleIgnoreModel', ignore);

      return setOriginTarget(los.remote.origin, los.remote.target, ignore, los.remote.display, state, game, los);
    },
    updateOriginTarget: function updateOriginTarget(state, game, los) {
      return setOriginTarget(los.remote.origin, los.remote.target, los.remote.ignore, los.remote.display, state, game, los);
    },

    toggleDisplay: function gameLosToggleDisplay(state, game, los) {
      var path = ['remote', 'display'];
      var display = !R.path(path, los);

      return setOriginTarget(los.remote.origin, los.remote.target, los.remote.ignore, display, state, game, los);
    },
    setLocal: function gameLosSetLocal(start, end, state, los) {
      return R.pipe(R.prop('local'), R.assoc('start', R.clone(start)), R.assoc('end', R.clone(end)), R.assoc('display', true), function (local) {
        state.changeEvent('Game.los.local.change');

        return R.assoc('local', local, los);
      })(los);
    },
    setRemote: function gameLosSetRemote(start, end, state, game, los) {
      los = R.assocPath(['local', 'display'], false, los);
      state.changeEvent('Game.los.local.change');

      los = R.pipe(R.assocPath(['remote', 'start'], R.clone(start)), R.assocPath(['remote', 'end'], R.clone(end)))(los);
      state.changeEvent('Game.los.remote.change');

      return setOriginTarget(los.remote.origin, los.remote.target, los.remote.ignore, true, state, game, los);
    },
    saveRemoteState: function gameLosSaveRemoteState(los) {
      return R.clone(R.prop('remote', los));
    },
    resetRemote: function gameLosResetRemote(remote, state, game, los) {
      los = R.assoc('remote', R.clone(remote), los);
      return setOriginTarget(los.remote.origin, los.remote.target, los.remote.ignore, los.remote.display, state, game, los);
    }
  };
  function setOriginTarget(origin, target, ignore, display, state, game, los) {
    los = R.pipe(R.assocPath(['remote', 'origin'], origin), R.assocPath(['remote', 'target'], target), R.assocPath(['remote', 'display'], display), R.assocPath(['remote', 'ignore'], []))(los);
    los = R.pipe(R.assocPath(['computed', 'envelope'], null), R.assocPath(['computed', 'darkness'], []), R.assocPath(['computed', 'shadow'], []))(los);

    if (!los.remote.origin || !los.remote.target) {
      state.changeEvent('Game.los.remote.change');
      return self.Promise.resolve(los);
    }

    los = R.over(R.lensPath(['remote', 'ignore']), R.defaultTo([]), los);
    return R.pipeP(function () {
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
      var envelope = circleService.envelopeTo(target_circle, origin_circle);
      los = R.assocPath(['computed', 'envelope'], envelope, los);

      return R.pipeP(function () {
        return computeIntervenings(state, game, los.remote.ignore, target, target_circle, origin, envelope);
      }, function (intervenings) {
        return [origin_circle, intervenings];
      })();
    }, function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2);

      var origin_circle = _ref4[0];
      var intervenings = _ref4[1];

      // console.log('gameLos intervenings', intervenings);

      var darkness = computeDarkness(origin_circle, intervenings);
      los = R.assocPath(['computed', 'darkness'], darkness, los);

      var shadow = computeShadow(origin_circle, intervenings);
      los = R.assocPath(['computed', 'shadow'], shadow, los);

      state.changeEvent('Game.los.remote.change');

      return los;
    })();
  }
  function getOriginTargetInfo(state, game, origin, target) {
    return R.pipePromise(function () {
      return [gameModelsService.findStamp(origin, game.models), gameModelsService.findStamp(target, game.models)];
    }, R.promiseAll, function (_ref5) {
      var _ref6 = _slicedToArray(_ref5, 2);

      var origin_state = _ref6[0].state;
      var target_state = _ref6[1].state;

      return R.pipePromise(function () {
        return [gameFactionsService.getModelInfo(origin_state.info, state.factions), gameFactionsService.getModelInfo(target_state.info, state.factions)];
      }, R.promiseAll, function (_ref7) {
        var _ref8 = _slicedToArray(_ref7, 2);

        var origin_info = _ref8[0];
        var target_info = _ref8[1];

        return [origin_state, origin_info, target_state, target_info];
      })();
    })();
  }
  function computeIntervenings(state, game, ignore, target, target_circle, origin, envelope) {
    return R.pipePromise(gameModelsService.all, R.map(function (model) {
      return R.pipeP(function () {
        return gameFactionsService.getModelInfo(model.state.info, state.factions);
      }, function (info) {
        return R.assoc('radius', info.base_radius, model.state);
      })();
    }), R.promiseAll, R.reject(function (circle) {
      return target === circle.stamp || origin === circle.stamp || target_circle.radius > circle.radius || R.find(R.equals(circle.stamp), ignore);
    }), R.filter(circleService.isInEnvelope$(envelope)))(game.models);
  }
  function computeDarkness(origin_circle, intervenings) {
    return R.map(function (circle) {
      return circleService.outsideEnvelopeTo(circle, [], origin_circle);
    }, intervenings);
  }
  function computeShadow(origin_circle, intervenings) {
    return R.map(function (circle) {
      return circleService.outsideEnvelopeTo(circle, intervenings, origin_circle);
    }, intervenings);
  }
  R.curryService(gameLosService);
  return gameLosService;
}]);
//# sourceMappingURL=los.js.map
