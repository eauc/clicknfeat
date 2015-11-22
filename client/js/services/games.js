'use strict';

angular.module('clickApp.services')
  .factory('games', [
    'localStorage',
    'jsonParser',
    'jsonStringifier',
    'game',
    function gamesServiceFactory(localStorageService,
                                 jsonParserService,
                                 jsonStringifierService,
                                 gameService) {
      var LOCAL_GAMES_STORAGE_KEY = 'clickApp.local_games';
      var gamesService = {
        loadLocalGames: function gamesLoadLocalGames() {
          return localStorageService.load(LOCAL_GAMES_STORAGE_KEY)
            .catch(function() {
              console.log('games: Failed to load local games');
            })
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
      };
      return gamesService;
    }
  ]);
