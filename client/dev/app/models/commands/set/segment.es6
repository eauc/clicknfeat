(function() {
  angular.module('clickApp.services')
    .factory('setSegmentCommand', setSegmentCommandModelFactory);

  setSegmentCommandModelFactory.$inject =[];
  function setSegmentCommandModelFactory() {
    return function buildSetSegmentCommandModel(type,
                                                gameSegmentModel) {
      const TYPE_LENS = R.lensProp(type);
      const setSegmentCommandModel = {
        executeP: setSegmentExecuteP,
        replayP: setSegmentReplayP,
        undoP: setSegmentUndoP
      };
      return setSegmentCommandModel;

      function setSegmentExecuteP(method, args, game) {
        const ctxt = {
          before: [],
          after: [],
          desc: method
        };
        return R.threadP(gameSegmentModel)(
          checkMethod,
          () => saveState('before', game),
          () => gameSegmentModel[method](...args, R.view(TYPE_LENS, game)),
          (segment) => R.set(TYPE_LENS, segment, game),
          (game) => saveState('after', game),
          (game) => [ctxt, game]
        );

        function checkMethod(gameSegmentModel) {
          return R.threadP(gameSegmentModel)(
            R.prop(method),
            R.type,
            R.rejectIfP(R.complement(R.equals('Function')),
                       `${s.capitalize(type)} unknown method "${method}"`)
          );
        }
        function saveState(when, game) {
          ctxt[when] = gameSegmentModel.saveRemoteState(R.view(TYPE_LENS, game));
          return game;
        }
      }
      function setSegmentReplayP(ctxt, game) {
        return R.over(
          TYPE_LENS,
          gameSegmentModel.resetRemote$(ctxt.after),
          game
        );
      }
      function setSegmentUndoP(ctxt, game) {
        return R.over(
          TYPE_LENS,
          gameSegmentModel.resetRemote$(ctxt.before),
          game
        );
      }
    };
  }
})();
