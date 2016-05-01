(function() {
  angular.module('clickApp.services')
    .factory('setSegmentCommand', setSegmentCommandModelFactory);

  setSegmentCommandModelFactory.$inject =[];
  function setSegmentCommandModelFactory() {
    return function buildSetSegmentCommandModel(type,
                                                gameSegmentModel) {
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
          () => gameSegmentModel[method]
            .apply(null, [...args, R.prop(type, game)]),
          (segment) => R.assoc(type, segment, game),
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
          ctxt[when] = gameSegmentModel.saveRemoteState(R.prop(type, game));
          return game;
        }
      }
      function setSegmentReplayP(ctxt, game) {
        return R.over(
          R.lensProp(type),
          gameSegmentModel.resetRemote$(ctxt.after),
          game
        );
      }
      function setSegmentUndoP(ctxt, game) {
        return R.over(
          R.lensProp(type),
          gameSegmentModel.resetRemote$(ctxt.before),
          game
        );
      }
    };
  }
})();
