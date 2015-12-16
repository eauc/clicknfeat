'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

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
        }
      };
    },
    isDisplayed: function gameLosIsDisplayed(los) {
      return R.path(['remote', 'display'], los);
    },
    origin: function gameLosOrigin(los) {
      return R.path(['remote', 'origin'], los);
    },
    setOrigin: function gameLosSetOrigin(origin_model, scope, los) {
      var origin = origin_model.state.stamp;
      var target = gameLosService.target(los);
      target = target === origin ? null : target;
      return setOriginTarget(origin, target, null, scope, los);
    },
    setOriginResetTarget: function gameLosSetOriginResetTarget(origin_model, scope, los) {
      var origin = origin_model.state.stamp;
      return setOriginTarget(origin, null, null, scope, los);
    },
    target: function gameLosTarget(los) {
      return R.path(['remote', 'target'], los);
    },
    setTarget: function gameLosSetTarget(target_model, scope, los) {
      var origin = gameLosService.origin(los);
      var target = target_model.state.stamp;
      origin = origin === target ? null : origin;
      return setOriginTarget(origin, target, null, scope, los);
    },
    toggleIgnoreModel: function toggleIgnoreModel(model, scope, los) {
      var ignore = R.pathOr([], ['remote', 'ignore'], los);
      var is_ignored = R.find(R.equals(model.state.stamp), ignore);
      ignore = is_ignored ? R.reject(R.equals(model.state.stamp), ignore) : R.append(model.state.stamp, ignore);
      console.log('toggleIgnoreModel', ignore);

      return setOriginTarget(los.remote.origin, los.remote.target, ignore, scope, los);
    },
    toggleDisplay: function gameLosToggleDisplay(scope, los) {
      var path = ['remote', 'display'];
      var is_displayed = R.path(path, los);
      los = R.assocPath(path, !is_displayed, los);

      scope.gameEvent('changeRemoteLos', los);
      return los;
    },
    setLocal: function gameLosSetLocal(start, end, scope, los) {
      return R.pipe(R.prop('local'), R.assoc('start', R.clone(start)), R.assoc('end', R.clone(end)), R.assoc('display', true), function (local) {
        scope.gameEvent('changeLocalLos');

        return R.assoc('local', local, los);
      })(los);
    },
    setRemote: function gameLosSetRemote(start, end, scope, los) {
      los.local = R.pipe(R.assoc('display', false))(los.local);
      scope.gameEvent('changeLocalLos');

      los.remote = R.pipe(R.assoc('start', R.clone(start)), R.assoc('end', R.clone(end)), R.assoc('display', true))(los.remote);

      scope.gameEvent('changeRemoteLos', los);
      return los;
    },
    saveRemoteState: function gameLosSaveRemoteState(los) {
      return R.clone(R.prop('remote', los));
    },
    resetRemote: function gameLosResetRemote(state, scope, los) {
      los = R.assoc('remote', R.clone(state), los);
      scope.gameEvent('changeRemoteLos', los);
      return los;
    }
  };
  function setOriginTarget(origin, target, ignore, scope, los) {
    los = R.assoc('remote', R.pipe(R.assoc('origin', origin), R.assoc('target', target), R.assoc('ignore', []), R.assoc('envelope', null), R.assoc('darkness', []), R.assoc('shadow', []))(los.remote), los);
    if (!los.remote.origin || !los.remote.target) {
      scope.gameEvent('changeRemoteLos', los);
      return los;
    }
    los.remote = R.assoc('ignore', R.defaultTo([], ignore), los.remote);

    return R.pipeP(function () {
      return getOriginTargetInfo(scope, los.remote.origin, los.remote.target);
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
      los = R.assoc('remote', R.pipe(R.assoc('envelope', envelope))(los.remote), los);

      return R.pipeP(function () {
        return computeIntervenings(scope, los.remote.ignore, target, target_circle, origin, envelope);
      }, function (intervenings) {
        return [origin_circle, intervenings];
      })();
    }, function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2);

      var origin_circle = _ref4[0];
      var intervenings = _ref4[1];

      console.log('gameLos intervenings', intervenings);

      var darkness = computeDarkness(origin_circle, intervenings);
      los = R.assoc('remote', R.pipe(R.assoc('darkness', darkness))(los.remote), los);

      var shadow = computeShadow(origin_circle, intervenings);
      los = R.assoc('remote', R.pipe(R.assoc('shadow', shadow))(los.remote), los);

      scope.gameEvent('changeRemoteLos', los);
      return los;
    })();
  }
  function getOriginTargetInfo(scope, origin, target) {
    return R.pipePromise(function () {
      return [gameModelsService.findStamp(origin, scope.game.models), gameModelsService.findStamp(target, scope.game.models)];
    }, R.promiseAll, function (_ref5) {
      var _ref6 = _slicedToArray(_ref5, 2);

      var origin_state = _ref6[0].state;
      var target_state = _ref6[1].state;

      return R.pipePromise(function () {
        return [gameFactionsService.getModelInfo(origin_state.info, scope.factions), gameFactionsService.getModelInfo(target_state.info, scope.factions)];
      }, R.promiseAll, function (_ref7) {
        var _ref8 = _slicedToArray(_ref7, 2);

        var origin_info = _ref8[0];
        var target_info = _ref8[1];

        return [origin_state, origin_info, target_state, target_info];
      })();
    })();
  }
  function computeIntervenings(scope, ignore, target, target_circle, origin, envelope) {
    return R.pipePromise(gameModelsService.all, R.map(function (model) {
      return R.pipeP(function () {
        return gameFactionsService.getModelInfo(model.state.info, scope.factions);
      }, function (info) {
        return R.assoc('radius', info.base_radius, model.state);
      })();
    }), R.promiseAll, R.reject(function (circle) {
      return target === circle.stamp || origin === circle.stamp || target_circle.radius > circle.radius || R.find(R.equals(circle.stamp), ignore);
    }), R.filter(circleService.isInEnvelope$(envelope)))(scope.game.models);
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
