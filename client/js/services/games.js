'use strict';

self.gamesServiceFactory = function gamesServiceFactory(localStorageService,
                                                        jsonParserService,
                                                        jsonStringifierService) {
  var LOCAL_GAMES_STORAGE_KEY = 'clickApp.local_games';
  var gamesService = {
    loadLocalGames: function() {
      var data = localStorageService.getItem(LOCAL_GAMES_STORAGE_KEY);
      return jsonParserService.parse(data)
        .then(R.defaultTo([]))
        .catch(function() {
          console.log('Failed to load local games');
          return [];
        });
    },
    storeLocalGames: function(games) {
      var json = jsonStringifierService.stringify(games);
      localStorageService.setItem(LOCAL_GAMES_STORAGE_KEY, json);
    },
    newLocalGame: function(game, local_games) {
      var ret = R.append(game, local_games);
      gamesService.storeLocalGames(ret);
      return ret;
    },
  };
  return gamesService;
};
