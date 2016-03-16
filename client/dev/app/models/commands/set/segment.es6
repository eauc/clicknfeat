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

      function setSegmentExecuteP(method, args, state, game) {
        const ctxt = {
          before: [],
          after: [],
          desc: method
        };
        return R.threadP(gameSegmentModel)(
          checkMethod,
          R.always(game),
          saveState('before'),
          () => gameSegmentModel[method]
            .apply(null, [...args, state, game, R.prop(type, game)]),
          (segment) => R.assoc(type, segment, game),
          saveState('after'),
          (game) => {
            state.queueChangeEventP(`Game.${type}.remote.change`);
            return [ctxt, game];
          }
        );

        function checkMethod(gameSegmentModel) {
          return R.threadP(gameSegmentModel)(
            R.prop(method),
            R.type,
            R.rejectIf(R.complement(R.equals('Function')),
                       `${s.capitalize(type)} unknown method "${method}"`)
          );
        }
        function saveState(when) {
          return (game) => {
            ctxt[when] = gameSegmentModel.saveRemoteState(R.prop(type, game));
            return game;
          };
        }
      }
      function setSegmentReplayP(ctxt, state, game) {
        return R.over(R.lensProp(type), R.pipe(
          gameSegmentModel.resetRemote$(ctxt.after, state, game),
          (segment) => {
            state.queueChangeEventP(`Game.${type}.remote.change`);
            return segment;
          }
        ), game);
      }
      function setSegmentUndoP(ctxt, state, game) {
        return R.over(R.lensProp(type), R.pipe(
          gameSegmentModel.resetRemote$(ctxt.before, state, game),
          (segment) => {
            state.queueChangeEventP(`Game.${type}.remote.change`);
            return segment;
          }
        ), game);
      }
    };
  }
})();
