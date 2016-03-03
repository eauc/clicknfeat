(function() {
  angular.module('clickApp.services')
    .factory('createElementCommand', createElementCommandModelFactory);

  createElementCommandModelFactory.$inject = [
    'point',
  ];
  function createElementCommandModelFactory(pointModel) {
    return function buildCreateElementCommandModel(type,
                                                   elementModel,
                                                   gameElementsModel,
                                                   gameElementSelectionModel) {
      const createElementCommandModel = {
        executeP: createElementExecuteP,
        replayP: createElementReplayP,
        undoP: createElementUndoP
      };

      const emitCreateEvent$ = R.curry(emitCreateEvent);
      const onCreatedElements$ = R.curry(onCreatedElements);

      return createElementCommandModel;

      function createElementExecuteP(create, is_flipped, state, game) {
        const add$ = pointModel.addToWithFlip$(is_flipped);
        return R.threadP(create)(
          R.prop(`${type}s`),
          R.map(addElementP),
          R.promiseAll,
          R.reject(R.isNil),
          R.rejectIf(R.isEmpty, `No valid ${type} definition`),
          onNewElements
        );

        function addElementP(element) {
          return R.thread(element)(
            add$(create.base),
            R.omit(['stamp']),
            tryToCreateElementP
          );
        }
        function onNewElements(elements) {
          const ctxt = {
            [`${type}s`]: R.map(elementModel.saveState, elements),
            desc: R.thread(elements)(
              R.head,
              R.pathOr([], ['state','info']),
              R.join('.')
            )
          };
          return R.thread(elements)(
            onCreatedElements$('local', state, game),
            (game) => {
              return [ctxt, game];
            }
          );
        }
      }
      function createElementReplayP(ctxt, state, game) {
        return R.threadP(ctxt)(
          R.prop(`${type}s`),
          R.map(tryToCreateElementP),
          R.promiseAll,
          R.reject(R.isNil),
          R.rejectIf(R.isEmpty, `No valid ${type} definition`),
          onCreatedElements$('remote', state, game)
        );
      }
      function createElementUndoP(ctxt, state, game) {
        const stamps = R.pluck('stamp', R.prop(`${type}s`, ctxt));
        return R.thread(game)(
          R.over(R.lensProp(`${type}s`),
                 gameElementsModel.removeStamps$(stamps)),
          R.over(R.lensProp(`${type}_selection`),
                 gameElementSelectionModel.removeFrom$('local', stamps, state)),
          R.over(R.lensProp(`${type}_selection`),
                 gameElementSelectionModel.removeFrom$('remote', stamps, state)),
          emitCreateEvent$(state)
        );
      }
      function tryToCreateElementP(element) {
        return elementModel
          .createP(element)
          .catch(R.always(null));
      }
      function onCreatedElements(selection, state, game, elements) {
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
          const stamps = R.map(R.path(['state','stamp']), elements);
          return R.thread(game)(
            R.prop(`${type}_selection`),
            gameElementSelectionModel
              .set$(selection, stamps, state),
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
