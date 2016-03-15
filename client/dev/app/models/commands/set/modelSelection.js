'use strict';

(function () {
  angular.module('clickApp.services').factory('setModelSelectionCommand', setModelSelectionCommandModelFactory);

  setModelSelectionCommandModelFactory.$inject = ['commands', 'gameModelSelection'];
  function setModelSelectionCommandModelFactory(commandsModel, gameModelSelectionModel) {
    var setModelSelectionCommandModel = {
      executeP: setModelSelectionExecuteP,
      replayP: setModelSelectionReplayP,
      undoP: setModelSelectionUndoP
    };
    commandsModel.registerCommand('setModelSelection', setModelSelectionCommandModel);
    return setModelSelectionCommandModel;

    function setModelSelectionExecuteP(method, stamps, state, game) {
      return R.threadP(gameModelSelectionModel)(R.prop(method), R.type, R.rejectIf(R.complement(R.equals('Function')), 'SetModelSelection unknown method ' + method), function () {
        var args = R.isNil(stamps) ? ['local', state, game.model_selection] : ['local', stamps, state, game.model_selection];
        return gameModelSelectionModel[method].apply(gameModelSelectionModel, args);
      }, function (selection) {
        return R.assoc('model_selection', selection, game);
      }, function (game) {
        var ctxt = {
          after: gameModelSelectionModel.get('local', game.model_selection),
          desc: '',
          do_not_log: true
        };
        return [ctxt, game];
      });
    }
    function setModelSelectionReplayP(ctxt, state, game) {
      var selection = gameModelSelectionModel.set('remote', ctxt.after, state, game.model_selection);
      game = R.assoc('model_selection', selection, game);
      return game;
    }
    function setModelSelectionUndoP() {
      return R.rejectP('!!! ERROR : WE SHOULD NOT BE HERE !!!');
    }
  }
})();
//# sourceMappingURL=modelSelection.js.map
