(function() {
  angular.module('clickApp.services')
    .factory('setLayersCommand', setLayersCommandModelFactory);

  setLayersCommandModelFactory.$inject = [
    'commands',
    'gameLayers',
  ];
  function setLayersCommandModelFactory(commandsModel,
                                        gameLayersModel) {
    const LAYERS_LENS = R.lensProp('layers');

    const setLayersCommandModel = {
      executeP: setLayersExecuteP,
      replayP: setLayersRedoP,
      undoP: setLayersUndoP
    };
    commandsModel.registerCommand('setLayers', setLayersCommandModel);
    return setLayersCommandModel;

    function setLayersExecuteP(method, arg, game) {
      return R.threadP(method)(
        checkMethodP,
        () => ({
          before: R.view(LAYERS_LENS, game),
          desc: `${method}(${arg})`
        }),
        (ctxt) => {
          game = R.over(
            LAYERS_LENS,
            gameLayersModel[`${method}$`](arg),
            game
          );
          ctxt.after = R.view(LAYERS_LENS, game);
          return [ ctxt, game ];
        }
      );
    }
    function setLayersRedoP(ctxt, game) {
      return R.set(LAYERS_LENS, ctxt.after, game);
    }
    function setLayersUndoP(ctxt, game) {
      return R.set(LAYERS_LENS, ctxt.before, game);
    }
    function checkMethodP(method) {
      return R.thread(method)(
        R.prop(R.__, gameLayersModel),
        R.type,
        R.rejectIfP(R.complement(R.equals)('Function'),
                    `Layers unknown method "${method}"`)
      );
    }
  }
})();
