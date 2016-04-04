(function() {
  angular.module('clickApp.services')
    .factory('onElementsCommand', onElementsCommandModelFactory);

  onElementsCommandModelFactory.$inject = [];
  function onElementsCommandModelFactory() {
    return function buildOnElementsCommandModel(type,
                                                elementModel,
                                                gameElementsModel,
                                                gameElementSelectionModel,
                                                options = {}) {
      const {
        checkIfModelRespondToMethod = true
      } = options;
      const onElementsCommandModel = {
        executeP: onElementsExecuteP,
        replayP: onElementsReplayP,
        undoP: onElementsUndoP
      };
      const applyMethodOnGameElementsP$ = R.curry(applyMethodOnGameElementsP);
      const setStates$ = R.curry(setStates);
      const saveStatesP$ = R.curry(saveStatesP);
      const setRemoteSelection$ = R.curry(setRemoteSelection);
      return onElementsCommandModel;

      function onElementsExecuteP(method, args, stamps, game) {
        const ctxt = {
          before: [],
          after: [],
          desc: method
        };
        return R.threadP(elementModel)(
          checkMethod,
          () => game,
          saveStatesP$(ctxt, 'before', stamps),
          applyMethodOnGameElementsP$(method, args, stamps),
          saveStatesP$(ctxt, 'after', stamps),
          (game) => [ctxt, game]
        );

        function checkMethod() {
          return ( checkIfModelRespondToMethod
                   ? R.threadP(elementModel)(
                     R.prop(method),
                     R.type,
                     R.rejectIfP(R.complement(R.equals('Function')),
                                `Unknown method "${method}" on ${type}`)
                   )
                   : true
                 );
        }
      }
      function onElementsReplayP(ctxt, game) {
        const stamps = R.pluck('stamp', ctxt.after);
        return R.thread(game)(
          setStates$(ctxt.after, stamps),
          setRemoteSelection$(stamps)
        );
      }
      function onElementsUndoP(ctxt, game) {
        const stamps = R.pluck('stamp', ctxt.before);
        return R.thread(game)(
          setStates$(ctxt.before, stamps),
          setRemoteSelection$(stamps)
        );
      }

      function applyMethodOnGameElementsP(method, args, stamps, game) {
        return R.threadP(game)(
          R.prop(`${type}s`),
          gameElementsModel.onStampsP$(method, args, stamps),
          R.assoc(`${type}s`, R.__, game)
        );
      }
      function setStates(states, stamps, game) {
        return R.over(
          R.lensProp(`${type}s`),
          gameElementsModel.setStateStamps$(states, stamps),
          game
        );
      }
      function saveStatesP(ctxt, prop, stamps, game) {
        return R.threadP(game)(
          R.prop(`${type}s`),
          gameElementsModel.fromStampsP$('saveState', [], stamps),
          (states) => {
            ctxt[prop] = states;
            return game;
          }
        );
      }
      function setRemoteSelection(stamps, game) {
        return R.over(
          R.lensProp(`${type}_selection`),
          gameElementSelectionModel.set$('remote', stamps),
          game
        );
      }
    };
  }
})();
