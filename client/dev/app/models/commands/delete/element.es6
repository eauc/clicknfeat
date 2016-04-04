(function() {
  angular.module('clickApp.models')
    .factory('deleteElementCommand', deleteElementCommandModelFactory);

  deleteElementCommandModelFactory.$inject = [];
  function deleteElementCommandModelFactory() {
    return function buildDeleteElementCommandModel(type,
                                                   elementModel,
                                                   gameElementsModel,
                                                   gameElementSelectionModel,
                                                   createElementFn) {
      const deleteElementCommandModel = {
        executeP: deleteElementExecuteP,
        replayP: deleteElementReplayP,
        undoP: deleteElementUndoP
      };
      const onDeletedStates$ = R.curry(onDeletedStates);
      createElementFn = R.thread(createElementFn)(
        R.defaultTo(tryToCreateElement),
        R.curry
      );
      return deleteElementCommandModel;

      function deleteElementExecuteP(stamps, game) {
        return R.thread(game)(
          R.prop(`${type}s`),
          gameElementsModel.findAnyStamps$(stamps),
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
            onDeletedStates$(game),
            (game) => [ctxt, game]
          );
        }
      }
      function deleteElementReplayP(ctxt, game) {
        return onDeletedStates(game, ctxt[`${type}s`]);
      }
      function deleteElementUndoP(ctxt, game) {
        return R.threadP(ctxt)(
          R.prop(`${type}s`),
          R.map(createElementFn),
          R.reject(R.isNil),
          R.rejectIfP(R.isEmpty, `No valid ${type} definition`),
          onNewCreatedElements
        );

        function onNewCreatedElements(elements) {
          const stamps = R.map(R.path(['state','stamp']), elements);
          return R.thread(game)(
            addToGameElements,
            addToGameElementSelection
          );

          function addToGameElements(game) {
            return R.thread(game)(
              R.prop(`${type}s`),
              gameElementsModel.add$(elements),
              R.assoc(`${type}s`, R.__, game)
            );
          }
          function addToGameElementSelection(game) {
            return R.thread(game)(
              R.prop(`${type}_selection`),
              gameElementSelectionModel.set$('remote', stamps),
              R.assoc(`${type}_selection`, R.__, game)
            );
          }
        }
      }
      function onDeletedStates(game, states) {
        const stamps = R.pluck('stamp', states);
        return R.thread(game)(
          removeFromGameElements,
          removeFromGameElementSelection
        );
        function removeFromGameElements(game){
          return R.thread(game)(
            R.prop(`${type}s`),
            gameElementsModel.removeStamps$(stamps),
            R.assoc(`${type}s`, R.__, game)
          );
        }
        function removeFromGameElementSelection(game) {
          return R.thread(game)(
            R.prop(`${type}_selection`),
            gameElementSelectionModel.removeFrom$('local', stamps),
            gameElementSelectionModel.removeFrom$('remote', stamps),
            R.assoc(`${type}_selection`, R.__, game)
          );
        }
      }
      function tryToCreateElement(element) {
        return elementModel.create(element);
      }
    };
  }
})();
