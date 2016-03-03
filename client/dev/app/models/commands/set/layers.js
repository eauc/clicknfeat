'use strict';

(function () {
  angular.module('clickApp.services').factory('setLayersCommand', setLayersCommandModelFactory);

  setLayersCommandModelFactory.$inject = ['commands', 'gameLayers'];
  function setLayersCommandModelFactory(commandsModel, gameLayersModel) {
    var setLayersCommandModel = {
      executeP: setLayersExecuteP,
      replayP: setLayersRedoP,
      undoP: setLayersUndoP
    };

    commandsModel.registerCommand('setLayers', setLayersCommandModel);
    return setLayersCommandModel;

    function setLayersExecuteP(cmd, l, state, game) {
      if ('Function' !== R.type(gameLayersModel[cmd])) {
        return R.rejectP('Layers unknown method "' + cmd + '"');
      }

      var ctxt = {
        before: game.layers,
        desc: cmd + '(' + l + ')'
      };
      game = R.over(R.lensProp('layers'), gameLayersModel[cmd + '$'](l), game);
      ctxt.after = game.layers;

      state.queueChangeEventP('Game.layers.change');

      return [ctxt, game];
    }
    function setLayersRedoP(ctxt, state, game) {
      game = R.assoc('layers', ctxt.after, game);

      state.queueChangeEventP('Game.layers.change');

      return game;
    }
    function setLayersUndoP(ctxt, state, game) {
      game = R.assoc('layers', ctxt.before, game);

      state.queueChangeEventP('Game.layers.change');

      return game;
    }
  }
})();
//# sourceMappingURL=layers.js.map
