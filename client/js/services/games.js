self.gamesServiceFactory = function gamesServiceFactory(localStorage) {
  var LOCAL_GAMES_STORAGE_KEY = 'clickApp.local_games';
  function loadLocalGames() {
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
  }
  var gamesService = {
    storeNewLocalGame: function(game) {
      var local_games = loadLocalGames();
      var ret = R.length(local_games);
      local_games = R.append(game, local_games);
      localStorage.setItem(LOCAL_GAMES_STORAGE_KEY, JSON.stringify(local_games));
      return ret;
    }
  };
  return gamesService;
};
