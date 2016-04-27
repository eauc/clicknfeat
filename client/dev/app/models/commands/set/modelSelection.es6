(function() {
  angular.module('clickApp.services')
    .factory('setModelSelectionCommand', setModelSelectionCommandModelFactory);

  setModelSelectionCommandModelFactory.$inject = [
    'commands',
    'gameModelSelection',
  ];
  function setModelSelectionCommandModelFactory(commandsModel,
                                                gameModelSelectionModel) {
    const SELECTION_LENS = R.lensProp('model_selection');
    const setModelSelectionCommandModel = {
      executeP: setModelSelectionExecuteP,
      replayP: setModelSelectionReplayP,
      undoP: setModelSelectionUndoP
    };
    commandsModel.registerCommand('setModelSelection',
                                  setModelSelectionCommandModel);
    return setModelSelectionCommandModel;

    function setModelSelectionExecuteP(method, stamps, game) {
      return R.threadP(gameModelSelectionModel)(
        R.prop(method),
        R.type,
        R.rejectIfP(R.complement(R.equals('Function')),
                   `SetModelSelection unknown method ${method}`),
        () => ( R.isNil(stamps)
                ? [ 'local', game.model_selection ]
                : [ 'local', stamps, game.model_selection ]
              ),
        (args) => gameModelSelectionModel[method]
          .apply(gameModelSelectionModel, args),
        (selection) => R.assoc('model_selection', selection, game),
        (game) => {
          const ctxt = {
            after: gameModelSelectionModel.get('local', game.model_selection),
            desc: '',
            do_not_log: true
          };
          return [ctxt, game];
        }
      );
    }
    function setModelSelectionReplayP(ctxt, game) {
      return R.over(
        SELECTION_LENS,
        gameModelSelectionModel.set$('remote', ctxt.after),
        game
      );
    }
    function setModelSelectionUndoP() {
      return R.rejectP('!!! ERROR : WE SHOULD NOT BE HERE !!!');
    }
  }
})();
