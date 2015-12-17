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
                                   gameModelsService
                                  ) {
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
        setOrigin: function gameLosSetOrigin(origin_model, scope, game, los) {
          var origin = origin_model.state.stamp;
          var target = gameLosService.target(los);
          target = (target === origin) ? null : target;
          let display = (target && origin);
          return setOriginTarget(origin, target, null, display,
                                 scope, game, los);
        },
        setOriginResetTarget: function gameLosSetOriginResetTarget(origin_model, scope, game, los) {
          var origin = origin_model.state.stamp;
          return setOriginTarget(origin, null, null, false,
                                 scope, game, los);
        },
        target: function gameLosTarget(los) {
          return R.path(['remote', 'target'], los);
        },
        setTarget: function gameLosSetTarget(target_model, scope, game, los) {
          var origin = gameLosService.origin(los);
          var target = target_model.state.stamp;
          origin = (origin === target) ? null : origin;
          let display = (target && origin);
          return setOriginTarget(origin, target, null, display,
                                 scope, game, los);
        },
        toggleIgnoreModel: function(model, scope, game, los) {
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
                                 scope, game, los);
        },
        updateOriginTarget(scope, game, los) {
          return setOriginTarget(los.remote.origin,
                                 los.remote.target,
                                 los.remote.ignore,
                                 los.remote.display,
                                 scope, game, los);
        },
        toggleDisplay: function gameLosToggleDisplay(scope, game, los) {
          let path = ['remote','display'];
          let display = !R.path(path, los);

          return setOriginTarget(los.remote.origin,
                                 los.remote.target,
                                 los.remote.ignore,
                                 display,
                                 scope, game, los);
        },
        setLocal: function gameLosSetLocal(start, end, scope, los) {
          return R.pipe(
            R.prop('local'),
            R.assoc('start', R.clone(start)),
            R.assoc('end', R.clone(end)),
            R.assoc('display', true),
            function(local) {
              scope.gameEvent('changeLocalLos');

              return R.assoc('local', local, los);
            }
          )(los);
        },
        setRemote: function gameLosSetRemote(start, end, scope, game, los) {
          los.local = R.pipe(
            R.assoc('display', false)
          )(los.local);          
          scope.gameEvent('changeLocalLos');

          los.remote = R.pipe(
            R.assoc('start', R.clone(start)),
            R.assoc('end', R.clone(end))
          )(los.remote);

          scope.gameEvent('changeRemoteLos', los);
          return setOriginTarget(los.remote.origin,
                                 los.remote.target,
                                 los.remote.ignore,
                                 true,
                                 scope, game, los);
        },
        saveRemoteState: function gameLosSaveRemoteState(los) {
          return R.clone(R.prop('remote', los));
        },
        resetRemote: function gameLosResetRemote(state, scope, game, los) {
          los = R.assoc('remote', R.clone(state), los);
          return setOriginTarget(los.remote.origin,
                                 los.remote.target,
                                 los.remote.ignore,
                                 los.remote.display,
                                 scope, game, los);
        },
      };
      function setOriginTarget(origin, target, ignore, display,
                               scope, game, los) {
        los.remote = R.pipe(
          R.assoc('origin', origin),
          R.assoc('target', target),
          R.assoc('display', display),
          R.assoc('ignore', [])
        )(los.remote);
        los.computed = R.pipe(
          R.assoc('envelope', null),
          R.assoc('darkness', []),
          R.assoc('shadow', [])
        )(los.computed);

        // registerListener('origin', origin, scope, los);
        // registerListener('target', target, scope, los);

        if( !los.remote.origin ||
            !los.remote.target ) {
          scope.gameEvent('changeRemoteLos', los);
          return self.Promise.resolve(los);
        }
        los.remote = R.pipe(
          R.assoc('ignore', R.defaultTo([], ignore))
        )(los.remote);
        
        return R.pipeP(
          () => {
            return getOriginTargetInfo(scope, game,
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
            los.computed = R.assoc('envelope', envelope, los.computed);

            return R.pipeP(
              () => {
                return computeIntervenings(scope, game, los.remote.ignore,
                                           target, target_circle,
                                           origin, envelope);
              },
              (intervenings) => {
                return [ origin_circle, intervenings ];
              }
            )();
          },
          ([ origin_circle, intervenings ]) => {
            console.log('gameLos intervenings', intervenings);

            let darkness = computeDarkness(origin_circle, intervenings);
            los.computed = R.assoc('darkness', darkness, los.computed);

            let shadow = computeShadow(origin_circle, intervenings);
            los.computed = R.assoc('shadow', shadow, los.computed);

            scope.gameEvent('changeRemoteLos', los);
            return los;
          }
        )();
      }
      function getOriginTargetInfo(scope, game, origin, target) {
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
                  gameFactionsService.getModelInfo(origin_state.info, scope.factions),
                  gameFactionsService.getModelInfo(target_state.info, scope.factions),
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
      function computeIntervenings(scope, game, ignore,
                                   target, target_circle,
                                   origin, envelope) {
        return R.pipePromise(
          gameModelsService.all,
          R.map((model) => {
            return R.pipeP(
              () => {
                return gameFactionsService
                  .getModelInfo(model.state.info, scope.factions);
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
          return circleService.outsideEnvelopeTo(circle, [], origin_circle);
        }, intervenings);
      }
      function computeShadow(origin_circle,
                             intervenings) {
        return R.map((circle) => {
          return circleService.outsideEnvelopeTo(circle, intervenings, origin_circle);
        }, intervenings);
      }
      R.curryService(gameLosService);
      return gameLosService;
    }
  ]);
