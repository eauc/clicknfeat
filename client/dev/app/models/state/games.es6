(function() {
  angular.module('clickApp.services')
    .factory('stateGames', stateGamesModelFactory);

  stateGamesModelFactory.$inject = [
    'game',
    'games',
    // 'fileImport',
  ];
  function stateGamesModelFactory(gameModel,
                                  gamesModel) {
                                  // fileImportService) {
    const stateGamesService = {
      create: stateGamesCreate,
      save: stateGamesSave,
      onStateInit: stateGamesOnInit,
      onGamesLocalCreate: stateGamesOnLocalCreate,
      // onGamesLocalLoad: stateOnGamesLocalLoad,
      // onGamesLocalLoadFile: stateOnGamesLocalLoadFile,
      onGamesLocalDelete: stateOnGamesLocalDelete,
    };
    const setLocalGames$ = R.curry(setLocalGames);
    const loadNewLocalGame$ = R.curry(loadNewLocalGame);

    R.curryService(stateGamesService);
    return stateGamesService;

    function stateGamesCreate(state) {
      state.local_games = {};
      state.games_ready = new self.Promise((resolve) => {
        state.onEvent('State.init',
                      stateGamesService.onStateInit$(state, resolve));
      });

      state.onEvent('Games.local.create',
                    stateGamesService.onGamesLocalCreate$(state));
      // state.onEvent('Games.local.load',
      //               stateGamesService.onGamesLocalLoad$(state));
      // state.onEvent('Games.local.loadFile',
      //               stateGamesService.onGamesLocalLoadFile$(state));
      state.onEvent('Games.local.delete',
                    stateGamesService.onGamesLocalDelete$(state));

      return state;
    }
    function stateGamesSave(state) {
      return state;
    }
    function stateGamesOnInit(state, ready, event) {
      event = event;
      return R.threadP()(
        gamesModel.loadLocalGamesP,
        setLocalGames$(state),
        ready
      );
    }
    function stateGamesOnLocalCreate(state, event) {
      event = event;
      return R.thread(state.user.state)(
        gameModel.create,
        loadNewLocalGame$(state)
      );
    }
    // function stateOnGamesLocalLoad(state, event, index) {
    //   state.changeEvent('Games.local.load', index);
    // }
    // function stateOnGamesLocalLoadFile(state, event, file) {
    //   return R.pipePromise(
    //     fileImportService.read$('json'),
    //     stateGamesService.loadNewLocalGame$(state)
    //   )(file);
    // }
    function stateOnGamesLocalDelete(state, event, id) {
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
  }
})();
