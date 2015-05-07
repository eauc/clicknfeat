self.gamesServiceFactory = function gamesServiceFactory(localStorage) {
  var LOCAL_GAMES_STORAGE_KEY = 'clickApp.local_games';
  var gamesService = {
    loadLocalGames: function() {
      var data = localStorage.getItem(LOCAL_GAMES_STORAGE_KEY);
      var local_games = [];
      if(R.exists(data)) {
        try {
          local_games = JSON.parse(data);
        }
        catch(e) {
          console.log('failed to load local games', e);
        }
      }
      return local_games;
    },
    storeLocalGames: function(games) {
      localStorage.setItem(LOCAL_GAMES_STORAGE_KEY, JSON.stringify(games));
    }
  };
  return gamesService;
};
