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
                                                   gameElementSelectionModel,
                                                   createElementFn) {
      const createElementCommandModel = {
        executeP: createElementExecuteP,
        replayP: createElementReplayP,
        undoP: createElementUndoP
      };
      const onCreatedElements$ = R.curry(onCreatedElements);
      createElementFn = R.thread(createElementFn)(
        R.defaultTo(tryToCreateElement),
        R.curry
      );
      return createElementCommandModel;

      function createElementExecuteP(create, is_flipped, game) {
        const add$ = pointModel.addToWithFlip$(is_flipped);
        return R.threadP(create)(
          R.prop(`${type}s`),
          R.map(addElement),
          R.reject(R.isNil),
          R.rejectIfP(R.isEmpty, `No valid ${type} definition`),
          onNewElements
        );

        function addElement(element) {
          return R.thread(element)(
            add$(create.base),
            R.omit(['stamp']),
            createElementFn
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
            onCreatedElements$('local', game),
            (game) => [ctxt, game]
          );
        }
      }
      function createElementReplayP(ctxt, game) {
        return R.threadP(ctxt)(
          R.prop(`${type}s`),
          R.map(createElementFn),
          R.reject(R.isNil),
          R.rejectIfP(R.isEmpty, `No valid ${type} definition`),
          onCreatedElements$('remote', game)
        );
      }
      function createElementUndoP(ctxt, game) {
        const stamps = R.pluck('stamp', R.prop(`${type}s`, ctxt));
        return R.thread(game)(
          R.over(R.lensProp(`${type}s`),
                 gameElementsModel.removeStamps$(stamps)),
          R.over(R.lensProp(`${type}_selection`),
                 gameElementSelectionModel.removeFrom$('local', stamps)),
          R.over(R.lensProp(`${type}_selection`),
                 gameElementSelectionModel.removeFrom$('remote', stamps))
        );
      }
      function tryToCreateElement(element) {
        return elementModel.create(element);
      }
      function onCreatedElements(selection, game, elements) {
        return R.thread(game)(
          addToGameElements,
          addToGameElementSelection
        );

        function addToGameElements(game) {
          return R.over(
            R.lensProp(`${type}s`),
            gameElementsModel.add$(elements),
            game
          );
        }
        function addToGameElementSelection(game) {
          const stamps = R.map(R.path(['state','stamp']), elements);
          return R.over(
            R.lensProp(`${type}_selection`),
            gameElementSelectionModel.set$(selection, stamps),
            game
          );
        }
      }
    };
  }
})();
