self.gameServiceFactory = function gameServiceFactory() {
  var gameService = {
    create: function gameCreate(player1) {
      var new_game = {
        players: {
          p1: { name: R.defaultTo('player1', player1.name) },
          p2: { name: null }
        }
      };
      return new_game;
    },
    playerName: function(p, game) {
      return R.defaultTo('John Doe', R.path(['players',p,'name'], game));
    },
    description: function gameDescription(game) {
      if(R.exists(game.description)) return game.description;
      return ( gameService.playerName('p1', game) +
               ' vs '+
               gameService.playerName('p2', game)
             );
    }
  };
  return gameService;
};
