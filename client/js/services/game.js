self.gameServiceFactory = function gameServiceFactory() {
  var gameService = {
    create: function(player1) {
      var new_game = {
        players: {
          p1: { name: R.defaultTo('player1', player1.name) },
          p2: { name: null }
        }
      };
      return new_game;
    }
  };
  return gameService;
};
