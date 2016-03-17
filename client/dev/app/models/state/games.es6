(function() {
  angular.module('clickApp.services')
    .factory('stateGames', stateGamesModelFactory);

  stateGamesModelFactory.$inject = [
    'game',
    'games',
    'fileImport',
  ];
  function stateGamesModelFactory(gameModel,
                                  gamesModel,
                                  fileImportService) {
    const stateGamesModel = {
      create: stateGamesCreate,
      save: stateGamesSave,
      onStateInit: stateGamesOnInit,
      onGamesLocalCreate: stateGamesOnLocalCreate,
      onGamesLocalLoad: stateGamesOnLocalLoad,
      onGamesLocalLoadFile: stateGamesOnLocalLoadFile,
      onGamesLocalDelete: stateGamesOnLocalDelete,
      loadNewLocalGame: loadNewLocalGame,
      onGamesOnlineCreate: stateGamesOnOnlineCreate,
      onGamesOnlineLoad: stateGamesOnOnlineLoad,
      onGamesOnlineLoadFile: stateGamesOnOnlineLoadFile,
      loadNewOnlineGame: loadNewOnlineGame
    };
    const setLocalGames$ = R.curry(setLocalGames);

    R.curryService(stateGamesModel);
    return stateGamesModel;

    function stateGamesCreate(state) {
      state.local_games = {};
      state.games_ready = new self.Promise((resolve) => {
        state.onEvent('State.init',
                      stateGamesModel.onStateInit$(state, resolve));
      });

      state.onEvent('Games.local.create',
                    stateGamesModel.onGamesLocalCreate$(state));
      state.onEvent('Games.local.load',
                    stateGamesModel.onGamesLocalLoad$(state));
      state.onEvent('Games.local.loadFile',
                    stateGamesModel.onGamesLocalLoadFile$(state));
      state.onEvent('Games.local.delete',
                    stateGamesModel.onGamesLocalDelete$(state));
      state.onEvent('Games.online.create',
                    stateGamesModel.onGamesOnlineCreate$(state));
      state.onEvent('Games.online.load',
                    stateGamesModel.onGamesOnlineLoad$(state));
      state.onEvent('Games.online.loadFile',
                    stateGamesModel.onGamesOnlineLoadFile$(state));

      return state;
    }
    function stateGamesSave(state) {
      return state;
    }
    function stateGamesOnInit(state, ready, _event_) {
      return R.threadP()(
        gamesModel.loadLocalGamesP,
        setLocalGames$(state),
        ready
      );
    }
    function stateGamesOnLocalCreate(state, _event_) {
      return R.thread(state.user.state)(
        gameModel.create,
        stateGamesModel.loadNewLocalGame$(state)
      );
    }
    function stateGamesOnLocalLoad(state, _event_, index) {
      state.queueChangeEventP('Games.local.load', index);
    }
    function stateGamesOnLocalLoadFile(state, _event_, file) {
      return R.threadP(file)(
        fileImportService.readP$('json'),
        stateGamesModel.loadNewLocalGame$(state)
      );
    }
    function stateGamesOnLocalDelete(state, _event_, id) {
      return R.thread(state.local_games)(
        gamesModel.removeLocalGame$(id),
        setLocalGames$(state)
      );
    }
    function setLocalGames(state, games) {
      state.local_games = games;
      console.log('stateSetLocalGames', state.local_games);
      state.queueChangeEventP('Games.local.change');
    }
    function loadNewLocalGame(state, game) {
      return R.thread(state.local_games)(
        gamesModel.newLocalGame$(game),
        setLocalGames$(state),
        () => {
          state.queueChangeEventP(
            'Games.local.load',
            R.prop('local_stamp', R.last(state.local_games))
          );
        }
      );
    }
    function stateGamesOnOnlineCreate(state, _event_) {
      return R.thread(state)(
        R.pathOr({}, ['user','state']),
        gameModel.create,
        stateGamesModel.loadNewOnlineGame$(state)
      );
    }
    function stateGamesOnOnlineLoad(state, _event_, id) {
      state.queueChangeEventP('Games.online.load', 'public', id);
    }
    function stateGamesOnOnlineLoadFile(state, _event_, file) {
      return R.threadP(file)(
        fileImportService.readP$('json'),
        stateGamesModel.loadNewOnlineGame$(state)
      ).catch(R.spyAndDiscardError('Failed to open online game file'));
    }
    function loadNewOnlineGame(state, game) {
      return R.threadP(game)(
        gamesModel.newOnlineGameP,
        R.prop('private_stamp'),
        (stamp) => {
          state.queueChangeEventP('Games.online.load', 'private', stamp);
        }
      );
    }
  }
})();
