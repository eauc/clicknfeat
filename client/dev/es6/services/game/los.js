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
          };
        },
        isDisplayed: function gameLosIsDisplayed(los) {
          return R.path(['remote','display'], los);
        },
        origin: function gameLosOrigin(los) {
          return R.path(['remote', 'origin'], los);
        },
        setOrigin: function gameLosSetOrigin(origin_model, scope, los) {
          var origin = origin_model.state.stamp;
          var target = gameLosService.target(los);
          target = (target === origin) ? null : target;
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
          origin = (origin === target) ? null : origin;
          return setOriginTarget(origin, target, null, scope, los);
        },
        toggleIgnoreModel: function(model, scope, los) {
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
                                 scope, los);
        },
        toggleDisplay: function gameLosToggleDisplay(scope, los) {
          let path = ['remote','display'];
          let is_displayed = R.path(path, los);
          los = R.assocPath(path, !is_displayed, los);

          scope.gameEvent('changeRemoteLos', los);
          return los;
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
        setRemote: function gameLosSetRemote(start, end, scope, los) {
          los.local = R.pipe(
            R.assoc('display', false)
          )(los.local);          
          scope.gameEvent('changeLocalLos');

          los.remote = R.pipe(
            R.assoc('start', R.clone(start)),
            R.assoc('end', R.clone(end)),
            R.assoc('display', true)
          )(los.remote);

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
        },
      };
      function setOriginTarget(origin, target, ignore, scope, los) {
        los = R.assoc('remote', R.pipe(
          R.assoc('origin', origin),
          R.assoc('target', target),
          R.assoc('ignore', []),
          R.assoc('envelope', null),
          R.assoc('darkness', []),
          R.assoc('shadow', [])
        )(los.remote), los);
        if( !los.remote.origin ||
            !los.remote.target ) {
          scope.gameEvent('changeRemoteLos', los);
          return los;
        }
        los.remote = R.assoc('ignore', R.defaultTo([], ignore), los.remote);
        
        return R.pipeP(
          () => {
            return getOriginTargetInfo(scope,
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
            los = R.assoc('remote', R.pipe(
              R.assoc('envelope', envelope)
            )(los.remote), los);

            return R.pipeP(
              () => {
                return computeIntervenings(scope, los.remote.ignore,
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
            los = R.assoc('remote', R.pipe(
              R.assoc('darkness', darkness)
            )(los.remote), los);

            let shadow = computeShadow(origin_circle, intervenings);
            los = R.assoc('remote', R.pipe(
              R.assoc('shadow', shadow)
            )(los.remote), los);

            scope.gameEvent('changeRemoteLos', los);
            return los;
          }
        )();
      }
      function getOriginTargetInfo(scope, origin, target) {
        return R.pipePromise(
          () => {
            return [
              gameModelsService.findStamp(origin, scope.game.models),
              gameModelsService.findStamp(target, scope.game.models),
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
      function computeIntervenings(scope, ignore,
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
        )(scope.game.models);
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
