(function() {
  angular.module('clickApp.services')
    .factory('createObjectivesCommand', createObjectivesCommandModelFactory);

  createObjectivesCommandModelFactory.$inject = [
    'appError',
    'commands',
    'createModelCommand',
    'deleteModelCommand',
    'gameModels',
    'gameScenario',
  ];
  function createObjectivesCommandModelFactory(appErrorService,
                                               commandsModel,
                                               createModelCommandModel,
                                               deleteModelCommandModel,
                                               gameModelsModel,
                                               gameScenarioModel) {
    const MODELS_LENS = R.lensProp('models');
    const createObjectivesCommandModel = {
      executeP: createObjectivesExecuteP,
      replayP: createObjectivesReplayP,
      undoP: createObjectivesUndoP
    };
    commandsModel.registerCommand('createObjectives', createObjectivesCommandModel);
    return createObjectivesCommandModel;

    function createObjectivesExecuteP(game) {
      const ctxt = {
        desc: ''
      };
      return R.threadP(game)(
        R.view(MODELS_LENS),
        gameModelsModel.all,
        R.filter(R.pipe(
          R.path(['state','info']),
          R.head,
          R.equals('scenario')
        )),
        R.map(R.path(['state','stamp'])),
        (stamps) => deleteModelCommandModel
          .executeP(stamps, game),
        ([delete_ctxt, game]) => {
          ctxt.del = delete_ctxt;
          return game;
        },
        (game) => {
          return R.thread(game)(
            R.prop('scenario'),
            gameScenarioModel.createObjectives,
            (objectives) => createModelCommandModel
              .executeP(objectives, false, game)
          );
        },
        ([create_ctxt, game]) => {
          ctxt.create = create_ctxt;
          return [ctxt, game];
        }
      );
    }
    function createObjectivesReplayP(ctxt, game) {
      return R.threadP(game)(
        (game) => deleteModelCommandModel.replayP(ctxt.del, game),
        (game) => createModelCommandModel.replayP(ctxt.create, game)
      );
    }
    function createObjectivesUndoP(ctxt, game) {
      return R.threadP(game)(
        (game) => createModelCommandModel.undoP(ctxt.create, game),
        (game) => deleteModelCommandModel.undoP(ctxt.del, game)
          .catch(R.pipe(appErrorService.emit, () => game))
      );
    }
  }
})();
