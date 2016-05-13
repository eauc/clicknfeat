(function() {
  angular.module('clickApp.services')
    .factory('appGames', stateGamesModelFactory);

  stateGamesModelFactory.$inject = [
    'behaviours',
    'appAction',
    'appState',
    'fileImport',
    'game',
    'games',
  ];
  function stateGamesModelFactory(behavioursModel,
                                  appActionService,
                                  appStateService,
                                  fileImportService,
                                  gameModel,
                                  gamesModel) {
    const LOCAL_GAMES_LENS = R.lensProp('local_games');

    const local = appStateService.state
            .map(R.viewOr([], LOCAL_GAMES_LENS));
    const load = {
      local: behavioursModel.signalModel.create()
    };
    let ready;

    const gamesService = {
      local, load, ready,
      // create: stateGamesCreate,
      localSet: actionGamesLocalSet,
      localUpdate: actionGamesLocalUpdate,
      localCreate: actionGamesLocalCreate,
      localLoadFile: actionGamesLocalLoadFile,
      localLoadNew: actionGamesLocalLoadNew,
      localLoad: actionGamesLocalLoad,
      localDelete: actionGamesLocalDelete,
      // onOnlineCreate: stateGamesOnOnlineCreate,
      // onOnlineLoadFile: stateGamesOnOnlineLoadFile,
      // loadNewOnlineGameP: loadNewOnlineGameP,
      // onOnlineLoad: stateGamesOnOnlineLoad
    };
    R.curryService(gamesService);

    mount();

    return gamesService;

    function mount() {
      appActionService
        .register('Games.local.set'       , actionGamesLocalSet)
        .register('Games.local.update'    , actionGamesLocalUpdate)
        .register('Games.local.create'    , actionGamesLocalCreate)
        .register('Games.local.loadFile'  , actionGamesLocalLoadFile)
        .register('Games.local.loadNew'   , actionGamesLocalLoadNew)
        .register('Games.local.load'      , actionGamesLocalLoad)
        .register('Games.local.delete'    , actionGamesLocalDelete);
        // .register('Games.online.create'   , stateGamesModel.onOnlineCreate)
        // .register('Games.online.load'     , stateGamesModel.onOnlineLoad)
        // .register('Games.online.loadFile' , stateGamesModel.onOnlineLoadFile);

      ready = gamesModel.loadLocalGamesP()
        .then((games) => {
          return appActionService.action
            .send(['Games.local.set', games]);
        });
    }
    function actionGamesLocalSet(state, games) {
      return R.set(LOCAL_GAMES_LENS, games, state);
    }
    function actionGamesLocalUpdate(state, game) {
      return R.over(
        LOCAL_GAMES_LENS,
        gamesModel.updateLocalGame$(game),
        state
      );
    }
    function actionGamesLocalCreate(state) {
      return R.thread(state.user.state)(
        gameModel.create,
        (game) => actionGamesLocalLoadNew(state, game)
      );
    }
    function actionGamesLocalLoadFile(_state_, file) {
      return R.threadP(file)(
        fileImportService.readP$('json'),
        (data) => appActionService.action
          .send(['Games.local.loadNew', data])
      );
    }
    function actionGamesLocalLoadNew(state, game) {
      return R.thread(state)(
        R.over(LOCAL_GAMES_LENS, gamesModel.newLocalGame$(game)),
        R.tap(R.pipe(
          R.view(LOCAL_GAMES_LENS),
          R.last,
          R.prop('local_stamp'),
          (id) => actionGamesLocalLoad(state, id)
        ))
      );
    }
    function actionGamesLocalLoad(_state_, index) {
      load.local.send(index);
    }
    function actionGamesLocalDelete(state, id) {
      return R.over(
        LOCAL_GAMES_LENS,
        gamesModel.removeLocalGame$(id),
        state
      );
    }
    // function stateGamesOnOnlineCreate(state) {
    //   return R.thread(state)(
    //     R.pathOr({}, ['user','state']),
    //     gameModel.create,
    //     stateGamesModel.loadNewOnlineGameP
    //   );
    // }
    // function stateGamesOnOnlineLoadFile(_state_, _event_, [file]) {
    //   return R.threadP(file)(
    //     fileImportService.readP$('json'),
    //     stateGamesModel.loadNewOnlineGameP
    //   ).catch(R.spyAndDiscardError('Failed to open online game file'));
    // }
    // function loadNewOnlineGameP(game) {
    //   return R.threadP(game)(
    //     gamesModel.newOnlineGameP,
    //     R.prop('private_stamp'),
    //     (id) => appStateService
    //       .emit('Games.online.load', 'private', id)
    //   );
    // }
    // function stateGamesOnOnlineLoad(_state_, _event_, [id]) {
    //   appStateService
    //     .emit('Games.online.load', 'public', id);
    // }
  }
})();
