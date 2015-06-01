'use strict';

self.gamesServiceFactory = function gamesServiceFactory(localStorageService,
                                                        jsonParserService,
                                                        gameService) {
  var LOCAL_GAMES_STORAGE_KEY = 'clickApp.local_games';
  var gamesService = {
    loadLocalGames: function() {
      var data = localStorageService.getItem(LOCAL_GAMES_STORAGE_KEY);
      return jsonParserService.parse(data)
        .catch(function() {
          console.log('Failed to load local games');
          return [];
        });
    },
    storeLocalGames: function(games) {
      var json = '['+R.join(',',R.map(gameService.toJson, games))+']';
      localStorageService.setItem(LOCAL_GAMES_STORAGE_KEY, json);
    }
  };
  return gamesService;
};
