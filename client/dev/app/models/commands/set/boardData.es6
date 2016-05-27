(function() {
  angular.module('clickApp.services')
    .factory('setBoardDataCommand', setBoardCommandModelFactory);

  setBoardCommandModelFactory.$inject = [
    'appError',
    'commands',
    'gameTerrains',
    'setBoardCommand',
    'createTerrainCommand',
    'deleteTerrainCommand',
  ];
  function setBoardCommandModelFactory(appErrorService,
                                       commandsService,
                                       gameTerrainsModel,
                                       setBoardCommandModel,
                                       createTerrainCommandModel,
                                       deleteTerrainCommandModel) {
    const setBoardDataCommandModel = {
      executeP: setBoardDataExecuteP,
      replayP: setBoardDataReplayP,
      undoP: setBoardDataUndoP
    };
    commandsService.registerCommand('setBoardData', setBoardDataCommandModel);
    return setBoardDataCommandModel;

    function setBoardDataExecuteP(data, game) {
      const ctxt = {};
      return R.threadP(game)(
        (game) => {
          return R.thread(game)(
            R.prop('terrains'),
            gameTerrainsModel.all,
            R.pluck('state'),
            R.pluck('stamp'),
            (stamps) => deleteTerrainCommandModel
              .executeP(stamps, game)
          );
        },
        ([delete_ctxt, game]) => {
          ctxt.delete_ctxt = delete_ctxt;
          return createTerrainCommandModel
            .executeP(data.terrain, false, game)
            .catch(R.pipe(appErrorService.emit,
                          R.defaultTo([{}, game])));
        },
        ([create_ctxt, game]) => {
          ctxt.create_ctxt = create_ctxt;
          return setBoardCommandModel
            .executeP(data.board, game)
            .catch(R.pipe(appErrorService.emit,
                          R.defaultTo([{}, game])));
        },
        ([set_ctxt, game]) => {
          ctxt.set_ctxt = set_ctxt;
          return [ctxt, game];
        }
      );
    }
    function setBoardDataReplayP(ctxt, game) {
      return R.threadP(game)(
        (game) => deleteTerrainCommandModel
          .replayP(ctxt.delete_ctxt, game),
        (game) => createTerrainCommandModel
          .replayP(ctxt.create_ctxt, game)
          .catch(R.pipe(appErrorService.emit,
                        R.defaultTo(game))),
        (game) => setBoardCommandModel
          .replayP(ctxt.set_ctxt, game)
      );
    }
    function setBoardDataUndoP(ctxt, game) {
      return R.threadP(game)(
        (game) => deleteTerrainCommandModel
          .undoP(ctxt.delete_ctxt, game)
          .catch(R.pipe(appErrorService.emit,
                        R.defaultTo(game))),
        (game) => createTerrainCommandModel
          .undoP(ctxt.create_ctxt, game),
        (game) => setBoardCommandModel
          .undoP(ctxt.set_ctxt, game)
      );
    }
  }
})();
