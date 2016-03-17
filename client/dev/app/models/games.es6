(function() {
  angular.module('clickApp.services')
    .factory('games', gamesModelFactory);

  gamesModelFactory.$inject = [
    'localStorage',
    'http',
    'game',
  ];
  function gamesModelFactory(localStorageService,
                             httpService,
                             gameModel) {
    const LOCAL_GAME_STORAGE_KEY = 'clickApp.game.';
    const gamesModel = {
      loadLocalGamesP: gamesLoadLocalGamesP,
      saveLocalGame: gamesSaveLocalGame,
      loadLocalGameP: gamesLoadLocalGameP,
      newLocalGame: gamesNewLocalGame,
      removeLocalGame: gamesRemoveLocalGame,
      updateLocalGame: gamesUpdateLocalGame,
      newOnlineGameP: gamesNewOnlineGameP,
      loadOnlineGameP: gamesLoadOnlineGameP
    };
    R.curryService(gamesModel);
    return gamesModel;

    function gamesLoadLocalGamesP() {
      return R.threadP(localStorageService.keys())(
        R.filter((k) => {
          return k.startsWith(LOCAL_GAME_STORAGE_KEY);
        }),
        R.map((k) => {
          return localStorageService
            .loadP(k)
            .catch(R.spyAndDiscardError('GamesModel: Failed to load local game', k));
        }),
        R.promiseAll,
        R.reject(R.isNil),
        R.defaultTo([]),
        R.spyWarn('Games local load')
      );
    }
    function gamesSaveLocalGame(game) {
      let key = LOCAL_GAME_STORAGE_KEY+game.local_stamp;
      console.warn('Game save', key, game);
      return localStorageService
        .save(key, game);
    }
    function gamesLoadLocalGameP(id) {
      let key = LOCAL_GAME_STORAGE_KEY+id;
      console.warn('Game load', key);
      return localStorageService
        .loadP(key);
    }
    function gamesNewLocalGame(game, games) {
      return R.thread(game)(
        R.assoc('local_stamp', R.guid()),
        gamesModel.saveLocalGame,
        R.flip(R.append)(games)
      );
    }
    function gamesRemoveLocalGame(id, games) {
      return R.thread(LOCAL_GAME_STORAGE_KEY+id)(
        localStorageService.removeItem,
        R.always(games),
        R.reject(R.propEq('local_stamp', id))
      );
    }
    function gamesUpdateLocalGame(game, games) {
      const game_index = R.findIndex(R.propEq('local_stamp',
                                              game.local_stamp),
                                     games);
      return R.thread(game)(
        gamesModel.saveLocalGame,
        R.always(games),
        R.update(game_index, game)
      );
    }
    function gamesNewOnlineGameP(game) {
      return R.threadP(game)(
        gameModel.pickForJson,
        R.spyWarn('upload game'),
        httpService.postP$('/api/games'),
        R.spyWarn('upload game response')
      );
    }
    function gamesLoadOnlineGameP(is_private, id) {
      const url = [
        '/api/games',
        (is_private ? 'private' : 'public'),
        id
      ].join('/');
      return R.threadP(url)(
        httpService.getP,
        R.spyError('Games: load online game')
      );
    }
  }
})();
