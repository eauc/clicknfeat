angular.module('clickApp.services')
  .factory('games', [
    'localStorage',
    'http',
    'game',
    function gamesServiceFactory(localStorageService,
                                 httpService,
                                 gameService) {
      var LOCAL_GAMES_STORAGE_KEY = 'clickApp.local_games';
      var gamesService = {
        loadLocalGames: function gamesLoadLocalGames() {
          return localStorageService.load(LOCAL_GAMES_STORAGE_KEY)
            .catch(R.spy('games: Failed to load local games'))
            .then(R.defaultTo([]));
        },
        storeLocalGames: function gamesStoreLocalGames(games) {
          return localStorageService.save(LOCAL_GAMES_STORAGE_KEY, games);
        },
        newLocalGame: function gamesNewLocalGame(game, games) {
          var ret = R.append(game, games);
          return gamesService.storeLocalGames(ret);
        },
        updateLocalGame: function gamesUpdateLocalGame(index, game, games) {
          var ret = R.update(index, game, games);
          return gamesService.storeLocalGames(ret);
        },
        removeLocalGame: function gamesRemoveLocalGame(index, games) {
          var ret = R.remove(index, 1, games);
          return gamesService.storeLocalGames(ret);
        },
        newOnlineGame: function gamesNewOnlineGame(game) {
          return R.pipePromise(
            gameService.pickForJson,
            R.spyError('upload game'),
            httpService.post$('/api/games'),
            R.spyError('upload game response')
          )(game);
        },
        loadOnlineGame: function gamesLoadOnlineGame(is_private, id) {
          var url = [
            '/api/games',
            (is_private ? 'private' : 'public'),
            id
          ].join('/');
          return R.pipeP(
            httpService.get,
            R.spyError('load online game')
          )(url);
        },
      };
      R.curryService(gamesService);
      return gamesService;
    }
  ]);
