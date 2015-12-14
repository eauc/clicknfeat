'use strict';

angular.module('clickApp.services').factory('gameLos', [
// 'point',
// 'model',
// 'gameModels',
function gameLosServiceFactory() // pointService
// modelService,
// gameModelsService
{
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
    // origin: function gameLosOrigin(los) {
    //   return R.path(['remote', 'origin'], los);
    // },
    // setOrigin: function gameLosSetOrigin(origin_model, scope, los) {
    //   var origin = origin_model.state.stamp;
    //   var target = gameLosService.target(los);
    //   target = (target === origin) ? null : target;
    //   var max_length = modelService.losMaxLength(origin_model);
    //   return setOriginTarget(origin, target, max_length, scope, los);
    // },
    // setOriginResetTarget: function gameLosSetOrigin(origin_model, scope, los) {
    //   var origin = origin_model.state.stamp;
    //   var max_length = modelService.losMaxLength(origin_model);
    //   return setOriginTarget(origin, null, max_length, scope, los);
    // },
    // target: function gameLosTarget(los) {
    //   return R.path(['remote', 'target'], los);
    // },
    // setTarget: function gameLosSetTarget(target_model, scope, los) {
    //   var origin = gameLosService.origin(los);
    //   var target = target_model.state.stamp;
    //   origin = (origin === target) ? null : origin;
    //   return setOriginTarget(origin, target, null, scope, los);
    // },
    toggleDisplay: function gameLosToggleDisplay(scope, los) {
      var path = ['remote', 'display'];
      los = R.assocPath(path, !R.path(path, los), los);
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

      los.remote = R.pipe(
      // R.assoc('origin', null),
      // R.assoc('target', null),
      R.assoc('start', R.clone(start)), R.assoc('end', R.clone(end)), R.assoc('display', true))(los.remote);

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
  // function setOriginTarget(origin, target, max_length, scope, los) {
  //   var display = R.exists(origin) && R.exists(target);
  //   los = R.assoc('remote', R.pipe(
  //     R.assoc('origin', origin),
  //     R.assoc('target', target),
  //     R.assoc('display', display),
  //     function(remote) {
  //       if(R.exists(max_length)) {
  //         return R.assoc('max', max_length, remote);
  //       }
  //       return remote;
  //     }
  //   )(los.remote), los);
  //   return setupRemoteLos(scope, los);
  // }
  // function setupRemoteLos(scope, los) {
  //   return R.pipeP(
  //     function() {
  //       var origin = R.path(['remote','origin'], los);
  //       if(R.exists(origin)) {
  //         return gameModelsService.findStamp(origin, scope.game.models)
  //           .catch(R.always(null));
  //       }
  //       return self.Promise.resolve(null);
  //     },
  //     function(origin_model) {
  //       return R.pipeP(
  //         function() {
  //           var target = R.path(['remote','target'], los);
  //           if(R.exists(target)) {
  //             return gameModelsService.findStamp(target, scope.game.models)
  //               .catch(R.always(null));
  //           }
  //           return self.Promise.resolve(null);
  //         },
  //         function(target_model) {
  //           if(R.exists(origin_model) &&
  //              R.exists(target_model)) {
  //             return modelService.shortestLineTo(scope.factions,
  //                                                target_model,
  //                                                origin_model);
  //           }
  //           if(R.exists(origin_model)) {
  //             return {
  //               start: R.pick(['x','y'], origin_model.state),
  //               end: R.pick(['x','y'], origin_model.state)
  //             };
  //           }
  //           if(R.exists(target_model)) {
  //             return {
  //               start: R.pick(['x','y'], target_model.state),
  //               end: R.pick(['x','y'], target_model.state)
  //             };
  //           }
  //           return R.pick(['start', 'end'], R.prop('remote', los));
  //         },
  //         function(line) {
  //           var models_dist = pointService.distanceTo(line.end, line.start);
  //           los = R.assoc('remote', R.pipe(
  //             R.assoc('start', line.start),
  //             enforceEndToMaxLength(line.end),
  //             function(remote) {
  //               var los_length = pointService.distanceTo(remote.end, remote.start);
  //               return R.pipe(
  //                 R.assoc('reached', los_length >= models_dist - 0.1),
  //                 R.assoc('length', Math.round(los_length * 10) / 100)
  //               )(remote);
  //             }
  //           )(los.remote), los);

  //           scope.gameEvent('changeRemoteLos', los);

  //           return los;
  //         }
  //       )();
  //     }
  //   )();
  // }
  R.curryService(gameLosService);
  return gameLosService;
}]);
//# sourceMappingURL=los.js.map
