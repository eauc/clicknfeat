(function() {
  angular.module('clickApp.services')
    .factory('gameLos', gameLosModelFactory);

  gameLosModelFactory.$inject = [
    'gameSegment',
    'point',
    'circle',
    'gameFactions',
    'gameModels',
  ];
  function gameLosModelFactory(gameSegmentModel,
                               pointModel,
                               circleModel,
                               gameFactionsModel,
                               gameModelsModel) {
    const base = gameSegmentModel('los');
    const gameLosModel = Object.create(base);
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

    const setOriginTarget$ = R.curry(setOriginTarget);

    R.curryService(gameLosModel);
    return gameLosModel;

    function gameLosCreate() {
      return R.deepExtend(base.create(), {
        computed: {}
      });
    }
    function gameLosToggleDisplay(state, game, los) {
      return R.thread(los)(
        base.toggleDisplay$(state, game),
        setOriginTarget$({}, state, game)
      );
    }
    function gameLosSetRemote(start, end, state, game, los) {
      return R.thread(los)(
        base.setRemote$(start, end, state, game),
        setOriginTarget$({}, state, game)
      );
    }
    function gameLosResetRemote(remote, state, game, los) {
      return R.thread(los)(
        base.resetRemote$(remote, state, game),
        setOriginTarget$({}, state, game)
      );
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
      const origin = origin_model.state.stamp;
      let target = gameLosModel.target(los);
      target = (target === origin) ? null : target;
      const display = (target && origin);
      return setOriginTarget({ origin: origin,
                               target: target,
                               ignore: null,
                               display: display
                             }, state, game, los);
    }
    function gameLosSetOriginResetTarget(origin_model, state, game, los) {
      const origin = origin_model.state.stamp;
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
      let origin = gameLosModel.origin(los);
      const target = target_model.state.stamp;
      origin = (origin === target) ? null : origin;
      const display = (target && origin);
      return setOriginTarget({ origin: origin,
                               target: target,
                               ignore: null,
                               display: display
                             }, state, game, los);
    }
    function gameLosToggleIgnoreModel(model, state, game, los) {
      let ignore = R.pathOr([], ['remote','ignore'], los);
      const is_ignored = R.find(R.equals(model.state.stamp),
                                ignore);
      ignore = ( is_ignored
                 ? R.reject(R.equals(model.state.stamp), ignore)
                 : R.append(model.state.stamp, ignore)
               );
      console.log('toggleIgnoreModel', ignore);

      return setOriginTarget({ ignore: ignore },
                             state, game, los);
    }
    function gameLosUpdateOriginTarget(state, game, los) {
      return setOriginTarget({}, state, game, los);
    }

    function setOriginTarget(update, state, game, los) {
      const {
        origin = R.path(['remote','origin'], los),
        target = R.path(['remote','target'], los),
        ignore = R.pathOr([], ['remote','ignore'], los),
        display = R.path(['remote','display'], los),
      } = update;

      los = R.thread(los)(
        R.assocPath(['remote','origin'], origin),
        R.assocPath(['remote','target'], target),
        R.assocPath(['remote','display'], display),
        R.assocPath(['remote','ignore'], R.defaultTo([], ignore)),
        R.assoc('computed', { envelope: null,
                              darkness: [],
                              shadow: [] })
      );

      if(los.remote.origin && los.remote.target) {
        updateEnveloppes();
      }
      state.queueChangeEventP('Game.los.remote.change');
      return los;

      function updateEnveloppes() {
        R.threadP()(
          () => getOriginTargetInfo(state, game,
                                    los.remote.origin,
                                    los.remote.target),
          ([origin_state, origin_info, target_state, target_info]) => {
            const origin_circle = {
              x: origin_state.x,
              y: origin_state.y,
              radius: origin_info.base_radius
            };
            const target_circle = {
              x: target_state.x,
              y: target_state.y,
              radius: target_info.base_radius
            };
            const envelope = circleModel.envelopeTo(target_circle, origin_circle);
            los.computed.envelope = envelope;

            return R.threadP()(
              () => computeIntervenings(state, game, los.remote.ignore,
                                        target, target_circle,
                                        origin, envelope),
              (intervenings) => [ origin_circle, intervenings ]
            );
          },
          ([ origin_circle, intervenings ]) => {
            const darkness = computeDarkness(origin_circle, intervenings);
            los.computed.darkness = darkness;

            const shadow = computeShadow(origin_circle, intervenings);
            los.computed.shadow = shadow;

            state.queueChangeEventP('Game.los.remote.change');
          }
        );
      }
    }
    function getOriginTargetInfo(state, game, origin, target) {
      return R.threadP()(
        () => [
          gameModelsModel.findStampP(origin, game.models),
          gameModelsModel.findStampP(target, game.models),
        ],
        R.promiseAll,
        ([{ state: origin_state }, { state: target_state }]) => {
          return R.threadP()(
            () => [
              gameFactionsModel.getModelInfoP(origin_state.info, state.factions),
              gameFactionsModel.getModelInfoP(target_state.info, state.factions),
            ],
            R.promiseAll,
            ([origin_info, target_info]) => [
              origin_state, origin_info,
              target_state, target_info,
            ]
          );
        }
      );
    }
    function computeIntervenings(state, game, ignore,
                                 target, target_circle,
                                 origin, envelope) {
      return R.threadP(game.models)(
        gameModelsModel.all,
        R.map(getModelCircle),
        R.promiseAll,
        R.reject(circleIsNotIntervening),
        R.filter(circleModel.isInEnvelope$(envelope))
      );

      function getModelCircle(model) {
        return R.threadP()(
          () => gameFactionsModel
            .getModelInfoP(model.state.info, state.factions),
          (info) => R.assoc('radius', info.base_radius, model.state)
        );
      }
      function circleIsNotIntervening(circle) {
        return (target === circle.stamp ||
                origin === circle.stamp ||
                target_circle.radius > circle.radius ||
                R.find(R.equals(circle.stamp), ignore)
               );
      }
    }
    function computeDarkness(origin_circle,
                             intervenings) {
      return R.map((circle) => circleModel
                   .outsideEnvelopeTo(circle, [], origin_circle),
                   intervenings);
    }
    function computeShadow(origin_circle,
                           intervenings) {
      return R.map((circle) => circleModel
                   .outsideEnvelopeTo(circle, intervenings, origin_circle),
                   intervenings);
    }
  }
})();
