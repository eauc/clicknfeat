angular.module('clickApp.services')
  .factory('games', [
    'localStorage',
    'http',
    'game',
    function gamesServiceFactory(localStorageService,
                                 httpService,
                                 gameService) {
      var LOCAL_GAMES_STORAGE_KEY = 'clickApp.games';
      var gamesService = {
        loadLocalGames: function gamesLoadLocalGames() {
          return R.pipeP(
            () => {
              return localStorageService
                .load(LOCAL_GAMES_STORAGE_KEY)
                .catch(R.spy('games: Failed to load local games'));
            },
            R.defaultTo([]),
            R.spyWarn('Games local load')
          )();
        },
        storeLocalGames: function gamesStoreLocalGames(games) {
          return R.pipePromise(
            R.map(gameService.pickForJson),
            R.spyWarn('Games local store'),
            localStorageService.save$(LOCAL_GAMES_STORAGE_KEY)
          )(games);
        },
        newLocalGame: function gamesNewLocalGame(game, games) {
          return R.append(game, games);
        },
        loadLocalGame: function gamesLoadLocalGame(id, games) {
          return new self.Promise((resolve, reject) => {
            if(id >= R.length(games)) {
              reject(`Unknown local game id ${id}`);
              return;
            }

            R.pipe(
              R.nth(id),
              R.spyError('Games: load local game'),
              resolve
            )(games);
          });
        },
        removeLocalGame: function gamesRemoveLocalGame(index, games) {
          return R.remove(index, 1, games);
        },
        updateLocalGame: function gamesUpdateLocalGame(index, game, games) {
          return R.update(parseInt(index), game, games);
        },
        newOnlineGame: function gamesNewOnlineGame(game) {
          return R.pipePromise(
            gameService.pickForJson,
            R.spyWarn('upload game'),
            httpService.post$('/api/games'),
            R.spyWarn('upload game response')
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
            R.spyError('Games: load online game')
          )(url);
        }
      };
      R.curryService(gamesService);
      return gamesService;
    }
  ]);
