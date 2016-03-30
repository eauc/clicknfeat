(function() {
  angular.module('clickApp.services')
    .factory('setModelSelectionCommand', setModelSelectionCommandModelFactory);

  setModelSelectionCommandModelFactory.$inject = [
    'commands',
    'gameModelSelection',
  ];
  function setModelSelectionCommandModelFactory(commandsModel,
                                                gameModelSelectionModel) {
    const setModelSelectionCommandModel = {
      executeP: setModelSelectionExecuteP,
      replayP: setModelSelectionReplayP,
      undoP: setModelSelectionUndoP
    };
    commandsModel.registerCommand('setModelSelection',
                                  setModelSelectionCommandModel);
    return setModelSelectionCommandModel;

    function setModelSelectionExecuteP(method, stamps, state, game) {
      return R.threadP(gameModelSelectionModel)(
        R.prop(method),
        R.type,
        R.rejectIfP(R.complement(R.equals('Function')),
                   `SetModelSelection unknown method ${method}`),
        () => {
          const args = ( R.isNil(stamps)
                         ? [ 'local', state, game.model_selection ]
                         : [ 'local', stamps, state, game.model_selection ]
                       );
          return gameModelSelectionModel[method]
            .apply(gameModelSelectionModel, args);
        },
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
    function setModelSelectionReplayP(ctxt, state, game) {
      const selection = gameModelSelectionModel
              .set('remote', ctxt.after, state, game.model_selection);
      game = R.assoc('model_selection', selection, game);
      return game;
    }
    function setModelSelectionUndoP() {
      return R.rejectP('!!! ERROR : WE SHOULD NOT BE HERE !!!');
    }
  }
})();
