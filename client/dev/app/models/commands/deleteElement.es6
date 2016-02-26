(function() {
  angular.module('clickApp.models')
    .factory('deleteElementCommand', deleteElementCommandModelFactory);

  deleteElementCommandModelFactory.$inject = [];
  function deleteElementCommandModelFactory() {
    return function buildDeleteElementCommandModel(type,
                                                   elementModel,
                                                   gameElementsModel,
                                                   gameElementSelectionModel) {
      const deleteElementCommandModel = {
        executeP: deleteElementExecuteP,
        replayP: deleteElementReplayP,
        undoP: deleteElementUndoP
      };

      const onDeletedStates$ = R.curry(onDeletedStates);
      const emitCreateEvent$ = R.curry(emitCreateEvent);

      return deleteElementCommandModel;

      function deleteElementExecuteP(stamps, state, game) {
        return R.threadP(game)(
          R.prop(`${type}s`),
          gameElementsModel.findAnyStampsP$(stamps),
          R.reject(R.isNil),
          R.map(elementModel.saveState),
          onNewDeletedStates
        );

        function onNewDeletedStates(states) {
          const ctxt = {
            [`${type}s`]: states,
            desc: ''
          };
          return R.thread(states)(
            onDeletedStates$(state, game),
            (game) => {
              return [ctxt, game];
            }
          );
        }
      }
      function deleteElementReplayP(ctxt, state, game) {
        return onDeletedStates(state, game, ctxt[`${type}s`]);
      }
      function deleteElementUndoP(ctxt, state, game) {
        return R.threadP(ctxt)(
          R.prop(`${type}s`),
          R.map(tryToCreateElement),
          R.promiseAll,
          R.reject(R.isNil),
          R.rejectIf(R.isEmpty, `No valid ${type} definition`),
          onNewCreatedElements
        );

        function tryToCreateElement(element) {
          return self.Promise
            .resolve(elementModel.create(element))
            .catch(R.always(null));
        }
        function onNewCreatedElements(elements) {
          const stamps = R.map(R.path(['state','stamp']), elements);
          return R.thread(game)(
            addToGameElements,
            addToGameElementSelection,
            emitCreateEvent$(state)
          );

          function addToGameElements(game) {
            return R.thread(game)(
              R.prop(`${type}s`),
              gameElementsModel.add$(elements),
              (game_elements) => {
                return R.assoc(`${type}s`, game_elements, game);
              }
            );
          }
          function addToGameElementSelection(game) {
            return R.thread(game)(
              R.prop(`${type}_selection`),
              gameElementSelectionModel.set$('remote', stamps, state),
              (selection) => {
                return R.assoc(`${type}_selection`, selection, game);
              }
            );
          }
        }
      }
      function onDeletedStates(state, game, states) {
        const stamps = R.pluck('stamp', states);
        return R.thread(game)(
          removeFromGameElements,
          removeFromGameElementSelection,
          emitCreateEvent$(state)
        );
        function removeFromGameElements(game){
          return R.thread(game)(
            R.prop(`${type}s`),
            gameElementsModel.removeStamps$(stamps),
            (game_elements) => {
              return R.assoc(`${type}s`, game_elements, game);
            }
          );
        }
        function removeFromGameElementSelection(game) {
          return R.thread(game)(
            R.prop(`${type}_selection`),
            gameElementSelectionModel.removeFrom$('local', stamps, state),
            gameElementSelectionModel.removeFrom$('remote', stamps, state),
            (selection) => {
              return R.assoc(`${type}_selection`, selection, game);
            }
          );
        }
      }
      function emitCreateEvent(state, game) {
        state.queueChangeEventP(`Game.${type}.create`);
        return game;
      }
    };
  }
})();
