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
      const emitChangeEvents$ = R.curry(emitChangeEvents);

      return onElementsCommandModel;

      function onElementsExecuteP(method, args, stamps, state, game) {
        return R.threadP(elementModel)(
          checkMethod,
          () => {
            const ctxt = {
              before: [],
              after: [],
              desc: method
            };

            return R.threadP(game)(
              saveStatesP$(ctxt, 'before', stamps),
              applyMethodOnGameElementsP$(method, args, stamps),
              saveStatesP$(ctxt, 'after', stamps),
              emitChangeEvents$(stamps, state),
              (game) => {
                return [ctxt, game];
              }
            );
          }
        );

        function checkMethod() {
          return ( checkIfModelRespondToMethod
                   ? R.threadP(elementModel)(
                     R.prop(method),
                     R.type,
                     R.rejectIf(R.complement(R.equals('Function')),
                                `Unknown method "${method}" on ${type}`)
                   )
                   : true
                 );
        }
      }
      function onElementsReplayP(ctxt, state, game) {
        const stamps = R.pluck('stamp', ctxt.after);
        return R.threadP(game)(
          setStates$(ctxt.after, stamps),
          setRemoteSelection$(stamps, state),
          emitChangeEvents$(stamps, state)
        );
      }
      function onElementsUndoP(ctxt, state, game) {
        const stamps = R.pluck('stamp', ctxt.before);
        return R.threadP(game)(
          setStates$(ctxt.before, stamps),
          setRemoteSelection$(stamps, state),
          emitChangeEvents$(stamps, state)
        );
      }

      function applyMethodOnGameElementsP(method, args, stamps, game) {
        return R.threadP(game)(
          R.prop(`${type}s`),
          gameElementsModel.onStampsP$(method, args, stamps),
          (elements) => {
            return R.assoc(`${type}s`, elements, game);
          }
        );
      }
      function setStates(states, stamps, game) {
        return R.threadP(game)(
          R.prop(`${type}s`),
          gameElementsModel.setStateStampsP$(states, stamps),
          (elements) => {
            return R.assoc(`${type}s`, elements, game);
          }
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
      function setRemoteSelection(stamps, state, game) {
        return R.thread(game)(
          R.prop(`${type}_selection`),
          gameElementSelectionModel.set$('remote', stamps, state),
          (selection) => {
            return R.assoc(`${type}_selection`, selection, game);
          }
        );
      }
      function emitChangeEvents(stamps, state, game) {
        R.forEach((stamp) => {
          state.queueChangeEventP(`Game.${type}.change.${stamp}`);
        }, stamps);
        return game;
      }
    };
  }
})();
