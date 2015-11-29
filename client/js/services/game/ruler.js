'use strict';

angular.module('clickApp.services')
  .factory('gameRuler', [
    'point',
    'model',
    'gameModels',
    function gameRulerServiceFactory(pointService,
                                     modelService,
                                     gameModelsService) {
      var gameRulerService = {
        create: function gameRulerCreate() {
          return {
            local: {
              display: false,
              start: { x: 0, y: 0 },
              end: { x: 0, y: 0 },
              length: null,
            },
            remote: {
              display: false,
              start: { x: 0, y: 0 },
              end: { x: 0, y: 0 },
              length: null,
            },
          };
        },
        isDisplayed: function gameRulerIsDisplayed(ruler) {
          return R.path(['remote','display'], ruler);
        },
        maxLength: function gameRulerMaxLength(ruler) {
          return R.defaultTo(0, R.path(['remote','max'], ruler));
        },
        setMaxLength: function gameRulerSetMaxLength(length, scope, ruler) {
          ruler = R.pipe(
            R.assocPath(['local', 'max'], length),
            R.assocPath(['remote', 'max'], length)
          )(ruler);
          return setupRemoteRuler(scope, ruler);
        },
        origin: function gameRulerOrigin(ruler) {
          return R.path(['remote', 'origin'], ruler);
        },
        setOrigin: function gameRulerSetOrigin(origin_model, scope, ruler) {
          var origin = origin_model.state.stamp;
          var target = gameRulerService.target(ruler);
          target = (target === origin) ? null : target;
          var display = R.exists(origin) && R.exists(target);
          ruler = R.assoc('remote', R.pipe(
            R.assoc('origin', origin),
            R.assoc('target', target),
            R.assoc('display', display)
          )(ruler.remote), ruler);
          return setupRemoteRuler(scope, ruler);
        },
        setOriginResetTarget: function gameRulerSetOrigin(origin_model, scope, ruler) {
          var origin = origin_model.state.stamp;
          ruler = R.assoc('remote', R.pipe(
            R.assoc('origin', origin),
            R.assoc('target', null),
            R.assoc('display', false)
          )(ruler.remote), ruler);
          return setupRemoteRuler(scope, ruler);
        },
        target: function gameRulerTarget(ruler) {
          return R.path(['remote', 'target'], ruler);
        },
        targetReached: function gameRulerTargetReached(ruler) {
          return R.path(['remote', 'reached'], ruler);
        },
        setTarget: function gameRulerSetTarget(target_model, scope, ruler) {
          var origin = gameRulerService.origin(ruler);
          var target = target_model.state.stamp;
          origin = (origin === target) ? null : origin;
          var display = R.exists(origin) && R.exists(target);
          ruler = R.assoc('remote', R.pipe(
            R.assoc('origin', origin),
            R.assoc('target', target),
            R.assoc('display', display)
          )(ruler.remote), ruler);
          return setupRemoteRuler(scope, ruler);
        },
        toggleDisplay: function gameRulerToggleDisplay(scope, ruler) {
          var path = ['remote','display'];
          ruler = R.assocPath(path, !R.path(path, ruler), ruler);
          scope.gameEvent('changeRemoteRuler');
          return ruler;
        },
        setLocal: function gameRulerSetLocal(start, end, scope, ruler) {
          return R.pipe(
            R.prop('local'),
            R.assoc('start', R.clone(start)),
            enforceEndToMaxLength(end),
            R.assoc('length', null),
            R.assoc('display', true),
            function(local) {
              scope.gameEvent('changeLocalRuler');

              return R.assoc('local', local, ruler);
            }
          )(ruler);
        },
        setRemote: function gameRulerSetRemote(start, end, scope, ruler) {
          ruler.local = R.pipe(
            R.assoc('display', false)
          )(ruler.local);          
          scope.gameEvent('changeLocalRuler');

          ruler.remote = R.pipe(
            R.assoc('origin', null),
            R.assoc('target', null),
            R.assoc('start', R.clone(start)),
            R.assoc('end', R.clone(end)),
            R.assoc('display', true)
          )(ruler.remote);

          return setupRemoteRuler(scope, ruler);
        },
        saveRemoteState: function gameRulerSaveRemoteState(ruler) {
          return R.clone(R.prop('remote', ruler));
        },
        resetRemote: function gameRulerResetRemote(state, scope, ruler) {
          var ret = R.pipe(
            R.assoc('remote', R.clone(state))
          )(ruler);
          scope.gameEvent('changeRemoteRuler');
          return ret;
        },
        // targetAoEPosition: function gameRulerTargetAoEPosition(models, ruler) {
        //   var dir = pointService.directionTo(ruler.remote.end, ruler.remote.start);
        //   var max = ruler.remote.length / 2;
        //   var end = ruler.remote.end;
        //   var target = gameRulerService.target(ruler);
        //   if( R.exists(target) &&
        //       gameRulerService.targetReached(ruler) ) {
        //     var target_model = gameModelsService.findStamp(target, models);
        //     if(R.exists(target_model)) {
        //       end = target_model.state;
        //     }
        //   }
        //   return R.pipe(
        //     R.pick(['x', 'y']),
        //     R.assoc('r', dir),
        //     R.assoc('m', max)
        //   )(end);
        // },
      };
      var enforceEndToMaxLength = R.curry(function _enforceEndToMaxLength(end, ruler) {
        var length = pointService.distanceTo(end, ruler.start);
        var dir = pointService.directionTo(end, ruler.start);
        var max = 10 * R.defaultTo(length/10, ruler.max);
        length = Math.min(length, max);
        end = pointService.translateInDirection(length, dir, ruler.start);
        return R.assoc('end', end, ruler);
      });
      // function setOriginTarget(line, origin, target, scope, ruler) {
      //   var display = ( R.exists(origin) && R.exists(target) );
      //   var models_dist = pointService.distanceTo(line.end, line.start);
      //   var ret = R.pipe(
      //     R.prop('remote'),
      //     R.assoc('max', R.path(['local', 'max'], ruler)),
      //     R.assoc('start', line.start),
      //     enforceEndToMaxLength(line.end),
      //     function(remote) {
      //       var ruler_length = pointService.distanceTo(remote.end, remote.start);
      //       return R.pipe(
      //         R.assoc('reached', ruler_length >= models_dist - 0.1),
      //         R.assoc('length', Math.round(ruler_length * 10) / 100)
      //       )(remote);
      //     },
      //     R.assoc('display', display),
      //     R.assoc('origin', origin),
      //     R.assoc('target', target),
      //     function(remote) {
      //       return R.assoc('remote', remote, ruler);
      //     }
      //   )(ruler);
      //   scope.gameEvent('changeRemoteRuler');
      //   return ret;
      // }
      function setupRemoteRuler(scope, ruler) {
        return R.pipeP(
          function() {
            var origin = R.path(['remote','origin'], ruler);
            if(R.exists(origin)) {
              return gameModelsService.findStamp(origin, scope.game.models)
                .catch(R.always(null));
            }
            return self.Promise.resolve(null);
          },
          function(origin_model) {
            return R.pipeP(
              function() {
                var target = R.path(['remote','target'], ruler);
                if(R.exists(target)) {
                  return gameModelsService.findStamp(target, scope.game.models)
                    .catch(R.always(null));
                }
                return self.Promise.resolve(null);
              },
              function(target_model) {
                if(R.exists(origin_model) &&
                   R.exists(target_model)) {
                  return modelService.shortestLineTo(scope.factions,
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
              },
              function(line) {
                var models_dist = pointService.distanceTo(line.end, line.start);
                ruler = R.assoc('remote', R.pipe(
                  R.assoc('start', line.start),
                  enforceEndToMaxLength(line.end),
                  function(remote) {
                    var ruler_length = pointService.distanceTo(remote.end, remote.start);
                    return R.pipe(
                      R.assoc('reached', ruler_length >= models_dist - 0.1),
                      R.assoc('length', Math.round(ruler_length * 10) / 100)
                    )(remote);
                  }
                )(ruler.remote), ruler);

                scope.gameEvent('changeRemoteRuler');

                return ruler;
              }
            )();
          }
        )();
      }
      R.curryService(gameRulerService);
      return gameRulerService;
    }
  ]);
