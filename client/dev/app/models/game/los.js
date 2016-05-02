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
      updateOriginTarget: gameLosUpdateOriginTarget,
      render: gameLosRender,
      renderEnveloppe: gameLosRenderEnveloppe
    });

    var setOriginTarget$ = R.curry(setOriginTarget);

    R.curryService(gameLosModel);
    return gameLosModel;

    function gameLosCreate() {
      return R.deepExtend(base.create(), {
        computed: {}
      });
    }
    function gameLosToggleDisplay(los) {
      return R.thread(los)(base.toggleDisplay, setOriginTarget$({}));
    }
    function gameLosSetRemote(start, end, _state_, los) {
      return R.thread(los)(base.setRemote$(start, end), setOriginTarget$({}));
    }
    function gameLosResetRemote(remote, los) {
      return R.thread(los)(base.resetRemote$(remote), setOriginTarget$({}));
    }
    function gameLosOrigin(los) {
      return R.path(['remote', 'origin'], los);
    }
    function gameLosClearOrigin(los) {
      return setOriginTarget({ origin: null,
        ignore: null,
        display: false
      }, los);
    }
    function gameLosSetOrigin(origin_model, los) {
      var origin = origin_model.state.stamp;
      var target = gameLosModel.target(los);
      target = target === origin ? null : target;
      var display = target && origin;
      return setOriginTarget({ origin: origin,
        target: target,
        ignore: null,
        display: display
      }, los);
    }
    function gameLosSetOriginResetTarget(origin_model, _state_, los) {
      var origin = origin_model.state.stamp;
      return setOriginTarget({ origin: origin,
        target: null,
        ignore: null,
        display: true
      }, los);
    }
    function gameLosTarget(los) {
      return R.path(['remote', 'target'], los);
    }
    function gameLosClearTarget(los) {
      return setOriginTarget({ target: null,
        ignore: null,
        display: false
      }, los);
    }
    function gameLosSetTarget(target_model, los) {
      var origin = gameLosModel.origin(los);
      var target = target_model.state.stamp;
      origin = origin === target ? null : origin;
      var display = target && origin;
      return setOriginTarget({ origin: origin,
        target: target,
        ignore: null,
        display: display
      }, los);
    }
    function gameLosToggleIgnoreModel(model, los) {
      var ignore = R.pathOr([], ['remote', 'ignore'], los);
      var is_ignored = R.find(R.equals(model.state.stamp), ignore);
      ignore = is_ignored ? R.reject(R.equals(model.state.stamp), ignore) : R.append(model.state.stamp, ignore);
      console.log('toggleIgnoreModel', ignore);

      return setOriginTarget({ ignore: ignore }, los);
    }
    function gameLosUpdateOriginTarget(los) {
      return setOriginTarget({}, los);
    }

    function setOriginTarget(update, los) {
      var _update$origin = update.origin;
      var origin = _update$origin === undefined ? R.path(['remote', 'origin'], los) : _update$origin;
      var _update$target = update.target;
      var target = _update$target === undefined ? R.path(['remote', 'target'], los) : _update$target;
      var _update$ignore = update.ignore;
      var ignore = _update$ignore === undefined ? R.pathOr([], ['remote', 'ignore'], los) : _update$ignore;
      var _update$display = update.display;
      var display = _update$display === undefined ? R.path(['remote', 'display'], los) : _update$display;

      los = R.thread(los)(R.assocPath(['remote', 'origin'], origin), R.assocPath(['remote', 'target'], target), R.assocPath(['remote', 'display'], display), R.assocPath(['remote', 'ignore'], R.defaultTo([], ignore)));

      return los;
    }
    function gameLosRender(_ref, los) {
      var in_los_mode = _ref.in_los_mode;
      var factions = _ref.factions;
      var models = _ref.models;

      var local = {
        show: los.local.display,
        x1: los.local.start.x,
        y1: los.local.start.y,
        x2: los.local.end.x,
        y2: los.local.end.y
      };
      var remote = {
        show: los.remote.display,
        x1: los.remote.start.x,
        y1: los.remote.start.y,
        x2: los.remote.end.x,
        y2: los.remote.end.y
      };
      var origin = undefined;
      if (R.exists(los.remote.origin) && (los.remote.display || in_los_mode)) {
        var origin_model = gameModelsModel.findStamp(los.remote.origin, models);
        if (R.exists(origin_model)) {
          var origin_info = gameFactionsModel.getModelInfo(origin_model.state.info, factions);
          if (R.exists(origin_info)) {
            origin = {
              cx: origin_model.state.x,
              cy: origin_model.state.y,
              radius: origin_info.base_radius
            };
          }
        }
      }
      var target = undefined;
      if (R.exists(los.remote.target) && (los.remote.display || in_los_mode)) {
        var target_model = gameModelsModel.findStamp(los.remote.target, models);
        if (R.exists(target_model)) {
          var target_info = gameFactionsModel.getModelInfo(target_model.state.info, factions);
          if (R.exists(target_info)) {
            target = {
              cx: target_model.state.x,
              cy: target_model.state.y,
              radius: target_info.base_radius
            };
          }
        }
      }
      return {
        local: local, remote: remote, origin: origin, target: target
      };
    }
    function gameLosRenderEnveloppe(state, los) {
      los.computed = {
        envelope: null,
        darkness: [],
        shadow: []
      };
      var display = los.remote.display && los.remote.origin && los.remote.target;
      if (display) {
        updateEnveloppes(state, los);
      }

      var _R$pathOr = R.pathOr({}, ['computed', 'envelope'], los);

      var _R$pathOr$left = _R$pathOr.left;
      _R$pathOr$left = _R$pathOr$left === undefined ? {} : _R$pathOr$left;
      var _R$pathOr$left$start = _R$pathOr$left.start;
      _R$pathOr$left$start = _R$pathOr$left$start === undefined ? {} : _R$pathOr$left$start;
      var _R$pathOr$left$start$ = _R$pathOr$left$start.x;
      var x1 = _R$pathOr$left$start$ === undefined ? 0 : _R$pathOr$left$start$;
      var _R$pathOr$left$start$2 = _R$pathOr$left$start.y;
      var y1 = _R$pathOr$left$start$2 === undefined ? 0 : _R$pathOr$left$start$2;
      var _R$pathOr$left$end = _R$pathOr$left.end;
      _R$pathOr$left$end = _R$pathOr$left$end === undefined ? {} : _R$pathOr$left$end;
      var _R$pathOr$left$end$x = _R$pathOr$left$end.x;
      var x2 = _R$pathOr$left$end$x === undefined ? 0 : _R$pathOr$left$end$x;
      var _R$pathOr$left$end$y = _R$pathOr$left$end.y;
      var y2 = _R$pathOr$left$end$y === undefined ? 0 : _R$pathOr$left$end$y;
      var _R$pathOr$right = _R$pathOr.right;
      _R$pathOr$right = _R$pathOr$right === undefined ? {} : _R$pathOr$right;
      var _R$pathOr$right$start = _R$pathOr$right.start;
      _R$pathOr$right$start = _R$pathOr$right$start === undefined ? {} : _R$pathOr$right$start;
      var _R$pathOr$right$start2 = _R$pathOr$right$start.x;
      var x4 = _R$pathOr$right$start2 === undefined ? 0 : _R$pathOr$right$start2;
      var _R$pathOr$right$start3 = _R$pathOr$right$start.y;
      var y4 = _R$pathOr$right$start3 === undefined ? 0 : _R$pathOr$right$start3;
      var _R$pathOr$right$end = _R$pathOr$right.end;
      _R$pathOr$right$end = _R$pathOr$right$end === undefined ? {} : _R$pathOr$right$end;
      var _R$pathOr$right$end$x = _R$pathOr$right$end.x;
      var x3 = _R$pathOr$right$end$x === undefined ? 0 : _R$pathOr$right$end$x;
      var _R$pathOr$right$end$y = _R$pathOr$right$end.y;
      var y3 = _R$pathOr$right$end$y === undefined ? 0 : _R$pathOr$right$end$y;

      var enveloppe = [[x1, y1].join(','), [x2, y2].join(','), [x3, y3].join(','), [x4, y4].join(',')].join(' ');
      var shadow = R.map(function (sh) {
        var _sh$left = sh.left;
        _sh$left = _sh$left === undefined ? {} : _sh$left;
        var _sh$left$start = _sh$left.start;
        _sh$left$start = _sh$left$start === undefined ? {} : _sh$left$start;
        var _sh$left$start$x = _sh$left$start.x;
        var x1 = _sh$left$start$x === undefined ? 0 : _sh$left$start$x;
        var _sh$left$start$y = _sh$left$start.y;
        var y1 = _sh$left$start$y === undefined ? 0 : _sh$left$start$y;
        var _sh$left$end = _sh$left.end;
        _sh$left$end = _sh$left$end === undefined ? {} : _sh$left$end;
        var _sh$left$end$x = _sh$left$end.x;
        var x2 = _sh$left$end$x === undefined ? 0 : _sh$left$end$x;
        var _sh$left$end$y = _sh$left$end.y;
        var y2 = _sh$left$end$y === undefined ? 0 : _sh$left$end$y;
        var _sh$right = sh.right;
        _sh$right = _sh$right === undefined ? {} : _sh$right;
        var _sh$right$start = _sh$right.start;
        _sh$right$start = _sh$right$start === undefined ? {} : _sh$right$start;
        var _sh$right$start$x = _sh$right$start.x;
        var x4 = _sh$right$start$x === undefined ? 0 : _sh$right$start$x;
        var _sh$right$start$y = _sh$right$start.y;
        var y4 = _sh$right$start$y === undefined ? 0 : _sh$right$start$y;
        var _sh$right$end = _sh$right.end;
        _sh$right$end = _sh$right$end === undefined ? {} : _sh$right$end;
        var _sh$right$end$x = _sh$right$end.x;
        var x3 = _sh$right$end$x === undefined ? 0 : _sh$right$end$x;
        var _sh$right$end$y = _sh$right$end.y;
        var y3 = _sh$right$end$y === undefined ? 0 : _sh$right$end$y;

        return [[x1, y1].join(','), [x2, y2].join(','), [x3, y3].join(','), [x4, y4].join(',')].join(' ');
      }, R.pathOr([], ['computed', 'shadow'], los));
      var darkness = R.map(function (dk) {
        var _dk$left = dk.left;
        _dk$left = _dk$left === undefined ? {} : _dk$left;
        var _dk$left$start = _dk$left.start;
        _dk$left$start = _dk$left$start === undefined ? {} : _dk$left$start;
        var _dk$left$start$x = _dk$left$start.x;
        var x1 = _dk$left$start$x === undefined ? 0 : _dk$left$start$x;
        var _dk$left$start$y = _dk$left$start.y;
        var y1 = _dk$left$start$y === undefined ? 0 : _dk$left$start$y;
        var _dk$left$end = _dk$left.end;
        _dk$left$end = _dk$left$end === undefined ? {} : _dk$left$end;
        var _dk$left$end$x = _dk$left$end.x;
        var x2 = _dk$left$end$x === undefined ? 0 : _dk$left$end$x;
        var _dk$left$end$y = _dk$left$end.y;
        var y2 = _dk$left$end$y === undefined ? 0 : _dk$left$end$y;
        var _dk$right = dk.right;
        _dk$right = _dk$right === undefined ? {} : _dk$right;
        var _dk$right$start = _dk$right.start;
        _dk$right$start = _dk$right$start === undefined ? {} : _dk$right$start;
        var _dk$right$start$x = _dk$right$start.x;
        var x4 = _dk$right$start$x === undefined ? 0 : _dk$right$start$x;
        var _dk$right$start$y = _dk$right$start.y;
        var y4 = _dk$right$start$y === undefined ? 0 : _dk$right$start$y;
        var _dk$right$end = _dk$right.end;
        _dk$right$end = _dk$right$end === undefined ? {} : _dk$right$end;
        var _dk$right$end$x = _dk$right$end.x;
        var x3 = _dk$right$end$x === undefined ? 0 : _dk$right$end$x;
        var _dk$right$end$y = _dk$right$end.y;
        var y3 = _dk$right$end$y === undefined ? 0 : _dk$right$end$y;

        return [[x1, y1].join(','), [x2, y2].join(','), [x3, y3].join(','), [x4, y4].join(',')].join(' ');
      }, R.pathOr([], ['computed', 'darkness'], los));

      return {
        display: display, enveloppe: enveloppe, shadow: shadow, darkness: darkness
      };
    }
    function updateEnveloppes(state, los) {
      R.thread()(function () {
        return getOriginTargetInfo(state, los.remote.origin, los.remote.target);
      }, function (_ref2) {
        var _ref3 = _slicedToArray(_ref2, 4);

        var origin_state = _ref3[0];
        var origin_info = _ref3[1];
        var target_state = _ref3[2];
        var target_info = _ref3[3];

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

        return R.thread()(function () {
          return computeIntervenings(state, los.remote.ignore, los.remote.target, target_circle, los.remote.origin, envelope);
        }, function (intervenings) {
          return [origin_circle, intervenings];
        });
      }, function (_ref4) {
        var _ref5 = _slicedToArray(_ref4, 2);

        var origin_circle = _ref5[0];
        var intervenings = _ref5[1];

        var darkness = computeDarkness(origin_circle, intervenings);
        los.computed.darkness = darkness;

        var shadow = computeShadow(origin_circle, intervenings);
        los.computed.shadow = shadow;
      });
    }
    function getOriginTargetInfo(state, origin, target) {
      return R.thread()(function () {
        return [gameModelsModel.findStamp(origin, state.game.models), gameModelsModel.findStamp(target, state.game.models)];
      }, function (_ref6) {
        var _ref7 = _slicedToArray(_ref6, 2);

        var origin_state = _ref7[0].state;
        var target_state = _ref7[1].state;

        return R.thread()(function () {
          return [gameFactionsModel.getModelInfo(origin_state.info, state.factions), gameFactionsModel.getModelInfo(target_state.info, state.factions)];
        }, function (_ref8) {
          var _ref9 = _slicedToArray(_ref8, 2);

          var origin_info = _ref9[0];
          var target_info = _ref9[1];
          return [origin_state, origin_info, target_state, target_info];
        });
      });
    }
    function computeIntervenings(state, ignore, target, target_circle, origin, envelope) {
      return R.thread(state.game.models)(gameModelsModel.all, R.map(getModelCircle), R.reject(circleIsNotIntervening), R.filter(circleModel.isInEnvelope$(envelope)));

      function getModelCircle(model) {
        return R.thread()(function () {
          return gameFactionsModel.getModelInfo(model.state.info, state.factions);
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
