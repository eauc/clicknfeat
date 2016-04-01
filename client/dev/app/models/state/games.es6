(function() {
  angular.module('clickApp.services')
    .factory('stateGames', stateGamesModelFactory);

  stateGamesModelFactory.$inject = [
    'game',
    'games',
    'fileImport',
    'state',
    'appState',
  ];
  function stateGamesModelFactory(gameModel,
                                  gamesModel,
                                  fileImportService,
                                  stateModel,
                                  appStateService) {
    const LOCAL_GAMES_LENS = R.lensProp('local_games');
    const stateGamesModel = {
      create: stateGamesCreate,
      onLocalSet: stateGamesOnLocalSet,
      onLocalCreate: stateGamesOnLocalCreate,
      onLocalLoadFile: stateGamesOnLocalLoadFile,
      onLocalLoadNew: stateGamesOnLocalLoadNew,
      onLocalLoad: stateGamesOnLocalLoad,
      onLocalDelete: stateGamesOnLocalDelete,
      onOnlineCreate: stateGamesOnOnlineCreate,
      onOnlineLoadFile: stateGamesOnOnlineLoadFile,
      loadNewOnlineGameP: loadNewOnlineGameP,
      onOnlineLoad: stateGamesOnOnlineLoad
    };
    R.curryService(stateGamesModel);
    stateModel.register(stateGamesModel);
    return stateGamesModel;

    function stateGamesCreate(state) {
      appStateService
        .addReducer('Games.local.set'       , stateGamesModel.onLocalSet)
        .addReducer('Games.local.create'    , stateGamesModel.onLocalCreate)
        .addReducer('Games.local.loadFile'  , stateGamesModel.onLocalLoadFile)
        .addReducer('Games.local.loadNew'   , stateGamesModel.onLocalLoadNew)
        .addReducer('Games.local.load'      , stateGamesModel.onLocalLoad)
        .addReducer('Games.local.delete'    , stateGamesModel.onLocalDelete)
        .addReducer('Games.online.create'   , stateGamesModel.onOnlineCreate)
        .addReducer('Games.online.load'     , stateGamesModel.onOnlineLoad)
        .addReducer('Games.online.loadFile' , stateGamesModel.onOnlineLoadFile);

      appStateService
        .onChange('AppState.change',
                  'Games.local.change',
                  R.view(LOCAL_GAMES_LENS));

      const local_games_ready = R.threadP()(
        gamesModel.loadLocalGamesP,
        (games) => appStateService.reduce('Games.local.set', games)
      );

      return R.thread(state)(
        R.set(LOCAL_GAMES_LENS, []),
        R.assoc('local_games_ready', local_games_ready)
      );
    }
    function stateGamesOnLocalSet(state, _event_, [games]) {
      return R.set(LOCAL_GAMES_LENS, games, state);
    }
    function stateGamesOnLocalCreate(state, _event_) {
      return R.thread(state.user.state)(
        gameModel.create,
        (game) => stateGamesModel
          .onLocalLoadNew(state, _event_, [game])
      );
    }
    function stateGamesOnLocalLoadFile(_state_, _event_, [file]) {
      return R.threadP(file)(
        fileImportService.readP$('json'),
        (data) => appStateService
          .reduce('Games.local.loadNew', data)
      );
    }
    function stateGamesOnLocalLoadNew(state, _event_, [game]) {
      return R.thread(state)(
        R.over(LOCAL_GAMES_LENS, gamesModel.newLocalGame$(game)),
        R.tap((state) => R.thread(state)(
          R.view(LOCAL_GAMES_LENS),
          R.last,
          R.prop('local_stamp'),
          (id) => stateGamesModel.onLocalLoad(state, _event_, [id])
        ))
      );
    }
    function stateGamesOnLocalLoad(_state_, _event_, [index]) {
      appStateService.emit('Games.local.load', index);
    }
    function stateGamesOnLocalDelete(state, _event_, [id]) {
      return R.over(
        LOCAL_GAMES_LENS,
        gamesModel.removeLocalGame$(id),
        state
      );
    }
    function stateGamesOnOnlineCreate(state) {
      return R.thread(state)(
        R.pathOr({}, ['user','state']),
        gameModel.create,
        stateGamesModel.loadNewOnlineGameP
      );
    }
    function stateGamesOnOnlineLoadFile(_state_, _event_, [file]) {
      return R.threadP(file)(
        fileImportService.readP$('json'),
        stateGamesModel.loadNewOnlineGameP
      ).catch(R.spyAndDiscardError('Failed to open online game file'));
    }
    function loadNewOnlineGameP(game) {
      return R.threadP(game)(
        gamesModel.newOnlineGameP,
        R.prop('private_stamp'),
        (id) => appStateService
          .emit('Games.online.load', 'private', id)
      );
    }
    function stateGamesOnOnlineLoad(_state_, _event_, [id]) {
      appStateService
        .emit('Games.online.load', 'public', id);
    }
  }
})();
