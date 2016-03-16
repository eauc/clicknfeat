(function() {
  angular.module('clickApp.services')
    .factory('gameRuler', gameRulerModelFactory);

  gameRulerModelFactory.$inject = [
    'gameSegment',
    'point',
    'model',
    'gameModels',
  ];
  function gameRulerModelFactory(gameSegmentModel,
                                 pointModel,
                                 modelModel,
                                 gameModelsModel) {
    const base = gameSegmentModel('ruler');
    const gameRulerModel = Object.create(base);
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
    const enforceEndToMaxLength$ = R.curry(enforceEndToMaxLength);
    const setupRemoteRuler$ = R.curry(setupRemoteRuler);
    R.curryService(gameRulerModel);
    return gameRulerModel;

    function gameRulerCreate() {
      return R.deepExtend(base.create(), {
        local: { length: null },
        remote: { length: null }
      });
    }
    function gameRulerMaxLength(ruler) {
      return R.pathOr(0, ['remote','max'], ruler);
    }
    function gameRulerSetMaxLength(length, state, game, ruler) {
      return R.thread(ruler)(
        R.assocPath(['local', 'max'], length),
        R.assocPath(['remote', 'max'], length),
        setupRemoteRuler$(state)
      );
    }
    function gameRulerOrigin(ruler) {
      return R.path(['remote', 'origin'], ruler);
    }
    function gameRulerClearOrigin(state, game, ruler) {
      return setOriginTarget({ origin: null },
                             state, ruler);
    }
    function gameRulerSetOrigin(origin_model, state, game, ruler) {
      const origin = origin_model.state.stamp;
      let target = gameRulerModel.target(ruler);
      target = (target === origin) ? null : target;
      const max_length = R.defaultTo(R.path(['remote', 'max'], ruler),
                                     modelModel.rulerMaxLength(origin_model));
      return setOriginTarget({ origin: origin,
                               target: target,
                               max_length: max_length
                             }, state, ruler);
    }
    function gameRulerSetOriginResetTarget(origin_model, state, game, ruler) {
      const origin = origin_model.state.stamp;
      const max_length = R.defaultTo(R.path(['remote', 'max'], ruler),
                                     modelModel.rulerMaxLength(origin_model));
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
    function gameRulerClearTarget(state, game, ruler) {
      return setOriginTarget({ target: null
                             }, state, ruler);
    }
    function gameRulerSetTarget(target_model, state, game, ruler) {
      let origin = gameRulerModel.origin(ruler);
      const target = target_model.state.stamp;
      origin = (origin === target) ? null : origin;
      return setOriginTarget({ origin: origin,
                               target: target
                             }, state, ruler);
    }
    function gameRulerUpdateOriginTarget(state, game, ruler) {
      return setupRemoteRuler(state, ruler);
    }
    function gameRulerSetLocal(start, end, state, game, ruler) {
      return R.over(R.lensProp('local'), R.pipe(
        R.assoc('start', R.clone(start)),
        enforceEndToMaxLength$(end),
        R.assoc('length', null),
        R.assoc('display', true),
        (local) => {
          state.queueChangeEventP('Game.ruler.local.change');
          return local;
        }
      ), ruler);
    }
    function gameRulerSetRemote(start, end, state, game, ruler) {
      return R.thread(ruler)(
        R.over(R.lensProp('local'), R.pipe(
          R.assoc('display', false),
          (local) => {
            state.queueChangeEventP('Game.ruler.local.change');
            return local;
          }
        )),
        R.over(R.lensProp('remote'), R.pipe(
          R.assoc('origin', null),
          R.assoc('target', null),
          R.assoc('start', R.clone(start)),
          R.assoc('end', R.clone(end)),
          R.assoc('display', true)
        )),
        setupRemoteRuler$(state)
      );
    }
    function gameRulerTargetAoEPositionP(models, ruler) {
      const dir = pointModel.directionTo(ruler.remote.end, ruler.remote.start);
      const max = ruler.remote.length / 2;
      const end = ruler.remote.end;
      const target = gameRulerModel.target(ruler);
      return R.threadP(end)(
        (end) => {
          if( R.exists(target) &&
              gameRulerModel.targetReached(ruler) ) {
            return R.threadP(models)(
              gameModelsModel.findStampP$(target),
              R.prop('state')
            );
          }
          return end;
        },
        R.pick(['x', 'y']),
        R.assoc('r', dir),
        R.assoc('m', max)
      );
    }
    function enforceEndToMaxLength(end, ruler) {
      let length = pointModel.distanceTo(end, ruler.start);
      const dir = pointModel.directionTo(end, ruler.start);
      const max = 10 * R.defaultTo(length/10, ruler.max);
      length = Math.min(length, max);
      end = pointModel.translateInDirection(length, dir, ruler.start);
      return R.assoc('end', end, ruler);
    }
    function setOriginTarget(update, state, ruler) {
      const {
        origin = gameRulerModel.origin(ruler),
        target = gameRulerModel.target(ruler),
        max_length = R.path(['remote', 'max'], ruler)
      } = update;
      const display = R.exists(origin) && R.exists(target);
      return R.thread(ruler)(
        R.over(R.lensProp('remote'), R.pipe(
          R.assoc('origin', origin),
          R.assoc('target', target),
          R.assoc('display', display),
          R.assoc('max', max_length)
        )),
        setupRemoteRuler$(state)
      );
    }
    function setupRemoteRuler(state, ruler) {
      return R.threadP(ruler)(
        getOriginModelP,
        (origin_model) => R.threadP(ruler)(
          getTargetModelP,
          (target_model) => getStartEnd(origin_model, target_model)
        ),
        ({ start, end }) => {
          const models_dist = pointModel.distanceTo(end, start);
          return R.over(R.lensProp('remote'), R.pipe(
            R.assoc('start', start),
            enforceEndToMaxLength$(end),
            (remote) => {
              const ruler_length = pointModel.distanceTo(remote.end, remote.start);
              state.queueChangeEventP('Game.ruler.remote.change');
              return R.thread(remote)(
                R.assoc('reached', ruler_length >= models_dist - 0.1),
                R.assoc('length', Math.round(ruler_length * 10) / 100)
              );
            }
          ), ruler);
        }
      );

      function getOriginModelP(ruler) {
        const origin = R.path(['remote','origin'], ruler);
        if(R.exists(origin)) {
          return gameModelsModel
            .findStampP(origin, state.game.models)
            .catch(R.always(null));
        }
        return null;
      }
      function getTargetModelP(ruler) {
        const target = R.path(['remote','target'], ruler);
        if(R.exists(target)) {
          return gameModelsModel
            .findStampP(target, state.game.models)
            .catch(R.always(null));
        }
        return null;
      }
      function getStartEnd(origin_model, target_model) {
        if(R.exists(origin_model) &&
           R.exists(target_model)) {
          return modelModel
            .shortestLineToP(state.factions,
                             target_model,
                             origin_model);
        }
        if(R.exists(origin_model)) {
          return {
            start: R.pick(['x','y'], origin_model.state),
            end: R.pick(['x','y'], origin_model.state)
          };
        }
        if(R.exists(target_model)) {
          return {
            start: R.pick(['x','y'], target_model.state),
            end: R.pick(['x','y'], target_model.state)
          };
        }
        return R.pick(['start', 'end'], R.prop('remote', ruler));
      }
    }
  }
})();
