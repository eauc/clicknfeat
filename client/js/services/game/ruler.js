'use strict';

self.gameRulerServiceFactory = function gameRulerServiceFactory(pointService) {
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
      return R.defaultTo(0, R.path(['local','max'], ruler));
    },
    setMaxLength: function gameRulerSetMaxLength(length, ruler) {
      return R.assocPath(['local', 'max'], length, ruler);
    },
    toggleDisplay: function gameRulerToggleDisplay(scope, ruler) {
      var path = ['remote','display'];
      var ret = R.pipe(
        R.assocPath(path, !R.path(path, ruler))
      )(ruler);
      scope.gameEvent('changeRemoteRuler', ret.remote);
      return ret;
    },
    setLocal: function gameRulerSetLocal(start, end, scope, ruler) {
      var ret = R.pipe(
        R.prop('local'),
        R.assoc('start', R.clone(start)),
        enforceEndToMaxLength(end),
        R.assoc('length', null),
        R.assoc('display', true),
        function(local) {
          return R.assoc('local', local, ruler);
        }
      )(ruler);
      scope.gameEvent('changeLocalRuler', ret.local);
      return ret;
    },
    setRemote: function gameRulerSetRemote(start, end, scope, ruler) {
      var ret = R.pipe(
        R.prop('remote'),
        R.assoc('max', R.path(['local', 'max'], ruler)),
        R.assoc('start', R.clone(start)),
        enforceEndToMaxLength(end),
        function(remote) {
          var distance = pointService.distanceTo(remote.end, remote.start);
          return R.assoc('length', Math.round(distance * 10) / 100, remote);
        },
        R.assoc('display', true),
        function(remote) {
          return R.assoc('remote', remote, ruler);
        }
      )(ruler);
      ret = R.pipe(
        R.prop('local'),
        R.assoc('display', false),
        function(local) {
          return R.assoc('local', local, ret);
        }
      )(ret);
      scope.gameEvent('changeLocalRuler', ret.local);
      scope.gameEvent('changeRemoteRuler', ret.remote);
      return ret;
    },
    saveRemoteState: function gameRulerSaveRemoteState(ruler) {
      return R.clone(R.prop('remote', ruler));
    },
    resetRemote: function gameRulerResetRemote(state, scope, ruler) {
      var ret = R.pipe(
        R.assoc('remote', R.clone(state))
      )(ruler);
      scope.gameEvent('changeRemoteRuler', ret.remote);
      return ret;
    }
  };
  var enforceEndToMaxLength = R.curry(function _enforceEndToMaxLength(end, ruler) {
    var length = pointService.distanceTo(end, ruler.start);
    var dir = pointService.directionTo(end, ruler.start);
    var max = 10 * R.defaultTo(length/10, ruler.max);
    length = Math.min(length, max);
    end = pointService.translateInDirection(length, dir, ruler.start);
    return R.assoc('end', end, ruler);
  });

  R.curryService(gameRulerService);
  return gameRulerService;
};
