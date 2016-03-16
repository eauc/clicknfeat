'use strict';

(function () {
  angular.module('clickApp.services').factory('gameRuler', gameRulerModelFactory);

  gameRulerModelFactory.$inject = ['gameSegment', 'point', 'model', 'gameModels'];
  function gameRulerModelFactory(gameSegmentModel, pointModel, modelModel, gameModelsModel) {
    var base = gameSegmentModel('ruler');
    var gameRulerModel = Object.create(base);
    R.deepExtend(gameRulerModel, {
      create: gameRulerCreate,
      maxLength: gameRulerMaxLength,
      setMaxLength: gameRulerSetMaxLength,
      setLocal: gameRulerSetLocal,
      setRemote: gameRulerSetRemote,
      origin: gameRulerOrigin,
      clearOrigin: gameRulerClearOrigin,
      setOrigin: gameRulerSetOrigin,
      setOriginResetTarget: gameRulerSetOriginResetTarget,
      target: gameRulerTarget,
      targetReached: gameRulerTargetReached,
      clearTarget: gameRulerClearTarget,
      setTarget: gameRulerSetTarget,
      updateOriginTarget: gameRulerUpdateOriginTarget,
      targetAoEPositionP: gameRulerTargetAoEPositionP
    });
    var enforceEndToMaxLength$ = R.curry(enforceEndToMaxLength);
    var setupRemoteRuler$ = R.curry(setupRemoteRuler);
    R.curryService(gameRulerModel);
    return gameRulerModel;

    function gameRulerCreate() {
      return R.deepExtend(base.create(), {
        local: { length: null },
        remote: { length: null }
      });
    }
    function gameRulerMaxLength(ruler) {
      return R.pathOr(0, ['remote', 'max'], ruler);
    }
    function gameRulerSetMaxLength(length, state, _game_, ruler) {
      return R.thread(ruler)(R.assocPath(['local', 'max'], length), R.assocPath(['remote', 'max'], length), setupRemoteRuler$(state));
    }
    function gameRulerOrigin(ruler) {
      return R.path(['remote', 'origin'], ruler);
    }
    function gameRulerClearOrigin(state, _game_, ruler) {
      return setOriginTarget({ origin: null }, state, ruler);
    }
    function gameRulerSetOrigin(origin_model, state, _game_, ruler) {
      var origin = origin_model.state.stamp;
      var target = gameRulerModel.target(ruler);
      target = target === origin ? null : target;
      var max_length = R.defaultTo(R.path(['remote', 'max'], ruler), modelModel.rulerMaxLength(origin_model));
      return setOriginTarget({ origin: origin,
        target: target,
        max_length: max_length
      }, state, ruler);
    }
    function gameRulerSetOriginResetTarget(origin_model, state, _game_, ruler) {
      var origin = origin_model.state.stamp;
      var max_length = R.defaultTo(R.path(['remote', 'max'], ruler), modelModel.rulerMaxLength(origin_model));
      return setOriginTarget({ origin: origin,
        target: null,
        max_length: max_length
      }, state, ruler);
    }
    function gameRulerTarget(ruler) {
      return R.path(['remote', 'target'], ruler);
    }
    function gameRulerTargetReached(ruler) {
      return R.path(['remote', 'reached'], ruler);
    }
    function gameRulerClearTarget(state, _game_, ruler) {
      return setOriginTarget({ target: null
      }, state, ruler);
    }
    function gameRulerSetTarget(target_model, state, _game_, ruler) {
      var origin = gameRulerModel.origin(ruler);
      var target = target_model.state.stamp;
      origin = origin === target ? null : origin;
      return setOriginTarget({ origin: origin,
        target: target
      }, state, ruler);
    }
    function gameRulerUpdateOriginTarget(state, _game_, ruler) {
      return setupRemoteRuler(state, ruler);
    }
    function gameRulerSetLocal(start, end, state, _game_, ruler) {
      return R.over(R.lensProp('local'), R.pipe(R.assoc('start', R.clone(start)), enforceEndToMaxLength$(end), R.assoc('length', null), R.assoc('display', true), function (local) {
        state.queueChangeEventP('Game.ruler.local.change');
        return local;
      }), ruler);
    }
    function gameRulerSetRemote(start, end, state, _game_, ruler) {
      return R.thread(ruler)(R.over(R.lensProp('local'), R.pipe(R.assoc('display', false), function (local) {
        state.queueChangeEventP('Game.ruler.local.change');
        return local;
      })), R.over(R.lensProp('remote'), R.pipe(R.assoc('origin', null), R.assoc('target', null), R.assoc('start', R.clone(start)), R.assoc('end', R.clone(end)), R.assoc('display', true))), setupRemoteRuler$(state));
    }
    function gameRulerTargetAoEPositionP(models, ruler) {
      var dir = pointModel.directionTo(ruler.remote.end, ruler.remote.start);
      var max = ruler.remote.length / 2;
      var end = ruler.remote.end;
      var target = gameRulerModel.target(ruler);
      return R.threadP(end)(function (end) {
        if (R.exists(target) && gameRulerModel.targetReached(ruler)) {
          return R.threadP(models)(gameModelsModel.findStampP$(target), R.prop('state'));
        }
        return end;
      }, R.pick(['x', 'y']), R.assoc('r', dir), R.assoc('m', max));
    }
    function enforceEndToMaxLength(end, ruler) {
      var length = pointModel.distanceTo(end, ruler.start);
      var dir = pointModel.directionTo(end, ruler.start);
      var max = 10 * R.defaultTo(length / 10, ruler.max);
      length = Math.min(length, max);
      end = pointModel.translateInDirection(length, dir, ruler.start);
      return R.assoc('end', end, ruler);
    }
    function setOriginTarget(update, state, ruler) {
      var _update$origin = update.origin;
      var origin = _update$origin === undefined ? gameRulerModel.origin(ruler) : _update$origin;
      var _update$target = update.target;
      var target = _update$target === undefined ? gameRulerModel.target(ruler) : _update$target;
      var _update$max_length = update.max_length;
      var max_length = _update$max_length === undefined ? R.path(['remote', 'max'], ruler) : _update$max_length;

      var display = R.exists(origin) && R.exists(target);
      return R.thread(ruler)(R.over(R.lensProp('remote'), R.pipe(R.assoc('origin', origin), R.assoc('target', target), R.assoc('display', display), R.assoc('max', max_length))), setupRemoteRuler$(state));
    }
    function setupRemoteRuler(state, ruler) {
      return R.threadP(ruler)(getOriginModelP, function (origin_model) {
        return R.threadP(ruler)(getTargetModelP, function (target_model) {
          return getStartEnd(origin_model, target_model);
        });
      }, function (_ref) {
        var start = _ref.start;
        var end = _ref.end;

        var models_dist = pointModel.distanceTo(end, start);
        return R.over(R.lensProp('remote'), R.pipe(R.assoc('start', start), enforceEndToMaxLength$(end), function (remote) {
          var ruler_length = pointModel.distanceTo(remote.end, remote.start);
          state.queueChangeEventP('Game.ruler.remote.change');
          return R.thread(remote)(R.assoc('reached', ruler_length >= models_dist - 0.1), R.assoc('length', Math.round(ruler_length * 10) / 100));
        }), ruler);
      });

      function getOriginModelP(ruler) {
        var origin = R.path(['remote', 'origin'], ruler);
        if (R.exists(origin)) {
          return gameModelsModel.findStampP(origin, state.game.models).catch(R.always(null));
        }
        return null;
      }
      function getTargetModelP(ruler) {
        var target = R.path(['remote', 'target'], ruler);
        if (R.exists(target)) {
          return gameModelsModel.findStampP(target, state.game.models).catch(R.always(null));
        }
        return null;
      }
      function getStartEnd(origin_model, target_model) {
        if (R.exists(origin_model) && R.exists(target_model)) {
          return modelModel.shortestLineToP(state.factions, target_model, origin_model);
        }
        if (R.exists(origin_model)) {
          return {
            start: R.pick(['x', 'y'], origin_model.state),
            end: R.pick(['x', 'y'], origin_model.state)
          };
        }
        if (R.exists(target_model)) {
          return {
            start: R.pick(['x', 'y'], target_model.state),
            end: R.pick(['x', 'y'], target_model.state)
          };
        }
        return R.pick(['start', 'end'], R.prop('remote', ruler));
      }
    }
  }
})();
//# sourceMappingURL=ruler.js.map
