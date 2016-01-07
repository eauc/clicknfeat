'use strict';

angular.module('clickApp.services')
  .factory('gameLos', [
    'point',
    'circle',
    'gameFactions',
    'gameModels',
    function gameLosServiceFactory(pointService,
                                   circleService,
                                   gameFactionsService,
                                   gameModelsService) {
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
          return R.path(['remote','display'], los);
        },
        origin: function gameLosOrigin(los) {
          return R.path(['remote', 'origin'], los);
        },
        clearOrigin: function gameLosClearOrigin(state, game, los) {
          return setOriginTarget(null, los.remote.target, null, false,
                                 state, game, los);
        },
        setOrigin: function gameLosSetOrigin(origin_model, state, game, los) {
          var origin = origin_model.state.stamp;
          var target = gameLosService.target(los);
          target = (target === origin) ? null : target;
          let display = (target && origin);
          return setOriginTarget(origin, target, null, display,
                                 state, game, los);
        },
        setOriginResetTarget: function gameLosSetOriginResetTarget(origin_model, state, game, los) {
          var origin = origin_model.state.stamp;
          return setOriginTarget(origin, null, null, false,
                                 state, game, los);
        },
        target: function gameLosTarget(los) {
          return R.path(['remote', 'target'], los);
        },
        clearTarget: function gameLosClearTarget(state, game, los) {
          return setOriginTarget(los.remote.origin, null, null, false,
                                 state, game, los);
        },
        setTarget: function gameLosSetTarget(target_model, state, game, los) {
          var origin = gameLosService.origin(los);
          var target = target_model.state.stamp;
          origin = (origin === target) ? null : origin;
          let display = (target && origin);
          return setOriginTarget(origin, target, null, display,
                                 state, game, los);
        },
        toggleIgnoreModel: function(model, state, game, los) {
          let ignore = R.pathOr([], ['remote','ignore'], los);
          let is_ignored = R.find(R.equals(model.state.stamp),
                                  ignore);
          ignore = ( is_ignored ?
                     R.reject(R.equals(model.state.stamp), ignore) :
                     R.append(model.state.stamp, ignore)
                   );
          console.log('toggleIgnoreModel', ignore);
          
          return setOriginTarget(los.remote.origin,
                                 los.remote.target,
                                 ignore,
                                 los.remote.display,
                                 state, game, los);
        },
        updateOriginTarget(state, game, los) {
          return setOriginTarget(los.remote.origin,
                                 los.remote.target,
                                 los.remote.ignore,
                                 los.remote.display,
                                 state, game, los);
        },
        toggleDisplay: function gameLosToggleDisplay(state, game, los) {
          let path = ['remote','display'];
          let display = !R.path(path, los);

          return setOriginTarget(los.remote.origin,
                                 los.remote.target,
                                 los.remote.ignore,
                                 display,
                                 state, game, los);
        },
        setLocal: function gameLosSetLocal(start, end, state, los) {
          return R.pipe(
            R.prop('local'),
            R.assoc('start', R.clone(start)),
            R.assoc('end', R.clone(end)),
            R.assoc('display', true),
            function(local) {
              state.changeEvent('Game.los.local.change');

              return R.assoc('local', local, los);
            }
          )(los);
        },
        setRemote: function gameLosSetRemote(start, end, state, game, los) {
          los = R.assocPath(['local','display'], false, los);          
          state.changeEvent('Game.los.local.change');

          los = R.pipe(
            R.assocPath(['remote','start'], R.clone(start)),
            R.assocPath(['remote','end'], R.clone(end))
          )(los);
          state.changeEvent('Game.los.remote.change');
          
          return setOriginTarget(los.remote.origin,
                                 los.remote.target,
                                 los.remote.ignore,
                                 true,
                                 state, game, los);
        },
        saveRemoteState: function gameLosSaveRemoteState(los) {
          return R.clone(R.prop('remote', los));
        },
        resetRemote: function gameLosResetRemote(remote, state, game, los) {
          los = R.assoc('remote', R.clone(remote), los);
          return setOriginTarget(los.remote.origin,
                                 los.remote.target,
                                 los.remote.ignore,
                                 los.remote.display,
                                 state, game, los);
        }
      };
      function setOriginTarget(origin, target, ignore, display,
                               state, game, los) {
        los = R.pipe(
          R.assocPath(['remote','origin'], origin),
          R.assocPath(['remote','target'], target),
          R.assocPath(['remote','display'], display),
          R.assocPath(['remote','ignore'], [])
        )(los);
        los = R.pipe(
          R.assocPath(['computed','envelope'], null),
          R.assocPath(['computed','darkness'], []),
          R.assocPath(['computed','shadow'], [])
        )(los);

        if( !los.remote.origin ||
            !los.remote.target ) {
          state.changeEvent('Game.los.remote.change');
          return self.Promise.resolve(los);
        }

        los = R.over(R.lensPath(['remote','ignore']),
                     R.defaultTo([]), los);
        return R.pipeP(
          () => {
            return getOriginTargetInfo(state, game,
                                       los.remote.origin,
                                       los.remote.target);
          },
          ([origin_state, origin_info, target_state, target_info]) => {
            let origin_circle = {
              x: origin_state.x,
              y: origin_state.y,
              radius: origin_info.base_radius
            };
            let target_circle = {
              x: target_state.x,
              y: target_state.y,
              radius: target_info.base_radius
            };
            let envelope = circleService.envelopeTo(target_circle, origin_circle);
            los = R.assocPath(['computed','envelope'], envelope, los);

            return R.pipeP(
              () => {
                return computeIntervenings(state, game, los.remote.ignore,
                                           target, target_circle,
                                           origin, envelope);
              },
              (intervenings) => {
                return [ origin_circle, intervenings ];
              }
            )();
          },
          ([ origin_circle, intervenings ]) => {
            // console.log('gameLos intervenings', intervenings);

            let darkness = computeDarkness(origin_circle, intervenings);
            los = R.assocPath(['computed','darkness'], darkness, los);

            let shadow = computeShadow(origin_circle, intervenings);
            los = R.assocPath(['computed','shadow'], shadow, los);

            state.changeEvent('Game.los.remote.change');

            return los;
          }
        )();
      }
      function getOriginTargetInfo(state, game, origin, target) {
        return R.pipePromise(
          () => {
            return [
              gameModelsService.findStamp(origin, game.models),
              gameModelsService.findStamp(target, game.models),
            ];
          },
          R.promiseAll,
          ([{ state: origin_state }, { state: target_state }]) => {
            return R.pipePromise(
              () => {
                return [
                  gameFactionsService.getModelInfo(origin_state.info, state.factions),
                  gameFactionsService.getModelInfo(target_state.info, state.factions),
                ];
              },
              R.promiseAll,
              ([origin_info, target_info]) => {
                return [
                  origin_state, origin_info,
                  target_state, target_info,
                ];
              }
            )();
          }
        )();
      }
      function computeIntervenings(state, game, ignore,
                                   target, target_circle,
                                   origin, envelope) {
        return R.pipePromise(
          gameModelsService.all,
          R.map((model) => {
            return R.pipeP(
              () => {
                return gameFactionsService
                  .getModelInfo(model.state.info, state.factions);
              },
              (info) => {
                return R.assoc('radius', info.base_radius, model.state);
              }
            )();
          }),
          R.promiseAll,
          R.reject((circle) => {
            return (target === circle.stamp ||
                    origin === circle.stamp ||
                    target_circle.radius > circle.radius ||
                    R.find(R.equals(circle.stamp), ignore)
                   );
          }),
          R.filter(circleService.isInEnvelope$(envelope))
        )(game.models);
      }                                      
      function computeDarkness(origin_circle,
                               intervenings) {
        return R.map((circle) => {
          return circleService
            .outsideEnvelopeTo(circle, [], origin_circle);
        }, intervenings);
      }
      function computeShadow(origin_circle,
                             intervenings) {
        return R.map((circle) => {
          return circleService
            .outsideEnvelopeTo(circle, intervenings, origin_circle);
        }, intervenings);
      }
      R.curryService(gameLosService);
      return gameLosService;
    }
  ]);
