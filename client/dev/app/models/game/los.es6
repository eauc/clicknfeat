(function() {
  angular.module('clickApp.services')
    .factory('gameLos', gameLosModelFactory);

  gameLosModelFactory.$inject = [
    'gameSegment',
    'circle',
    'gameFactions',
    'gameModels',
  ];
  function gameLosModelFactory(gameSegmentModel,
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
      updateOriginTarget: gameLosUpdateOriginTarget,
      render:  gameLosRender,
      renderEnveloppe:  gameLosRenderEnveloppe
    });

    const setOriginTarget$ = R.curry(setOriginTarget);

    R.curryService(gameLosModel);
    return gameLosModel;

    function gameLosCreate() {
      return R.deepExtend(base.create(), {
        computed: {}
      });
    }
    function gameLosToggleDisplay(los) {
      return R.thread(los)(
        base.toggleDisplay,
        setOriginTarget$({})
      );
    }
    function gameLosSetRemote(start, end, _state_, los) {
      return R.thread(los)(
        base.setRemote$(start, end),
        setOriginTarget$({})
      );
    }
    function gameLosResetRemote(remote, los) {
      return R.thread(los)(
        base.resetRemote$(remote),
        setOriginTarget$({})
      );
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
      const origin = origin_model.state.stamp;
      let target = gameLosModel.target(los);
      target = (target === origin) ? null : target;
      const display = (target && origin);
      return setOriginTarget({ origin: origin,
                               target: target,
                               ignore: null,
                               display: display
                             }, los);
    }
    function gameLosSetOriginResetTarget(origin_model, _state_, los) {
      const origin = origin_model.state.stamp;
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
      let origin = gameLosModel.origin(los);
      const target = target_model.state.stamp;
      origin = (origin === target) ? null : origin;
      const display = (target && origin);
      return setOriginTarget({ origin: origin,
                               target: target,
                               ignore: null,
                               display: display
                             }, los);
    }
    function gameLosToggleIgnoreModel(model, los) {
      let ignore = R.pathOr([], ['remote','ignore'], los);
      const is_ignored = R.find(R.equals(model.state.stamp),
                                ignore);
      ignore = ( is_ignored
                 ? R.reject(R.equals(model.state.stamp), ignore)
                 : R.append(model.state.stamp, ignore)
               );
      console.log('toggleIgnoreModel', ignore);

      return setOriginTarget({ ignore: ignore }, los);
    }
    function gameLosUpdateOriginTarget(los) {
      return setOriginTarget({}, los);
    }

    function setOriginTarget(update, los) {
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
        R.assocPath(['remote','ignore'], R.defaultTo([], ignore))
      );

      return los;
    }
    function gameLosRender({ in_los_mode,
                             factions, models }, los) {
      const local = {
        show: los.local.display,
        x1: los.local.start.x,
        y1: los.local.start.y,
        x2: los.local.end.x,
        y2: los.local.end.y
      };
      const remote = {
        show: los.remote.display,
        x1: los.remote.start.x,
        y1: los.remote.start.y,
        x2: los.remote.end.x,
        y2: los.remote.end.y
      };
      let origin;
      if(R.exists(los.remote.origin) &&
         (los.remote.display || in_los_mode)) {
        const origin_model = gameModelsModel
                .findStamp(los.remote.origin, models);
        if(R.exists(origin_model)) {
          const origin_info = gameFactionsModel
                  .getModelInfo(origin_model.state.info, factions);
          if(R.exists(origin_info)) {
            origin = {
              cx: origin_model.state.x,
              cy: origin_model.state.y,
              radius: origin_info.base_radius
            };
          }
        }
      }
      let target;
      if(R.exists(los.remote.target) &&
         (los.remote.display || in_los_mode)) {
        const target_model = gameModelsModel
                .findStamp(los.remote.target, models);
        if(R.exists(target_model)) {
          const target_info = gameFactionsModel
                  .getModelInfo(target_model.state.info, factions);
          if(R.exists(target_info)) {
            target = {
              cx: target_model.state.x,
              cy: target_model.state.y,
              radius: target_info.base_radius
            };
          }
        }
      }
      return {
        local, remote, origin, target
      };
    }
    function gameLosRenderEnveloppe(state, los) {
      los.computed = {
        envelope: null,
        darkness: [],
        shadow: []
      };
      const display = ( los.remote.display &&
                        los.remote.origin &&
                        los.remote.target
                      );
      if(display) {
        updateEnveloppes(state, los);
      }
      const {
        left:  { start: { x: x1 = 0, y: y1 = 0 } = {},
                 end:   { x: x2 = 0, y: y2 = 0 } = {}
               } = {},
        right: { start: { x: x4 = 0, y: y4 = 0 } = {},
                 end:   { x: x3 = 0, y: y3 = 0 } = {}
               } = {}
      } = R.pathOr({}, ['computed', 'envelope'], los);
      const enveloppe = [
        [ x1, y1 ].join(','),
        [ x2, y2 ].join(','),
        [ x3, y3 ].join(','),
        [ x4, y4 ].join(','),
      ].join(' ');
      const shadow = R.map((sh) => {
        const {
          left:  { start: { x: x1 = 0, y: y1 = 0 } = {},
                   end:   { x: x2 = 0, y: y2 = 0 } = {}
                 } = {},
          right: { start: { x: x4 = 0, y: y4 = 0 } = {},
                   end:   { x: x3 = 0, y: y3 = 0 } = {}
                 } = {}
        } = sh;
        return [
          [ x1, y1 ].join(','),
          [ x2, y2 ].join(','),
          [ x3, y3 ].join(','),
          [ x4, y4 ].join(','),
        ].join(' ');
      }, R.pathOr([], ['computed', 'shadow'], los));
      const darkness = R.map((dk) => {
        const {
          left:  { start: { x: x1 = 0, y: y1 = 0 } = {},
                   end:   { x: x2 = 0, y: y2 = 0 } = {}
                 } = {},
          right: { start: { x: x4 = 0, y: y4 = 0 } = {},
                   end:   { x: x3 = 0, y: y3 = 0 } = {}
                 } = {}
        } = dk;
        return [
          [ x1, y1 ].join(','),
          [ x2, y2 ].join(','),
          [ x3, y3 ].join(','),
          [ x4, y4 ].join(','),
        ].join(' ');
      }, R.pathOr([], ['computed', 'darkness'], los));

      return {
        display, enveloppe, shadow, darkness
      };
    }
    function updateEnveloppes(state, los) {
      R.thread()(
        () => getOriginTargetInfo(state,
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

          return R.thread()(
            () => computeIntervenings(state, los.remote.ignore,
                                      los.remote.target, target_circle,
                                      los.remote.origin, envelope),
            (intervenings) => [ origin_circle, intervenings ]
          );
        },
        ([ origin_circle, intervenings ]) => {
          const darkness = computeDarkness(origin_circle, intervenings);
          los.computed.darkness = darkness;

          const shadow = computeShadow(origin_circle, intervenings);
          los.computed.shadow = shadow;
        }
      );
    }
    function getOriginTargetInfo(state, origin, target) {
      return R.thread()(
        () => [
          gameModelsModel.findStamp(origin, state.game.models),
          gameModelsModel.findStamp(target, state.game.models),
        ],
        ([{ state: origin_state }, { state: target_state }]) => {
          return R.thread()(
            () => [
              gameFactionsModel.getModelInfo(origin_state.info, state.factions),
              gameFactionsModel.getModelInfo(target_state.info, state.factions),
            ],
            ([origin_info, target_info]) => [
              origin_state, origin_info,
              target_state, target_info,
            ]
          );
        }
      );
    }
    function computeIntervenings(state, ignore,
                                 target, target_circle,
                                 origin, envelope) {
      return R.thread(state.game.models)(
        gameModelsModel.all,
        R.map(getModelCircle),
        R.reject(circleIsNotIntervening),
        R.filter(circleModel.isInEnvelope$(envelope))
      );

      function getModelCircle(model) {
        return R.thread()(
          () => gameFactionsModel
            .getModelInfo(model.state.info, state.factions),
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
