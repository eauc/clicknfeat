'use strict';

self.gameServiceFactory = function gameServiceFactory(commandsService) {
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
    load: function(scope, data) {
      var game = R.deepExtend({
        players: {
          p1: { name: null },
          p2: { name: null }
        },
        board: {},
        commands: [],
      }, data);
      gameReplay(scope, game);
      return game;
    },
    toJson: function gameToJson(game) {
      var json = JSON.stringify(R.pick(['players', 'commands'], game),
                                jsonFilter);
      console.log('game tojson', json);
      return json;
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
    },
    executeCommand: function(/* ...args..., scope, game */) {
      var args = Array.prototype.slice.apply(arguments);
      var command = commandsService.execute.apply(null, args);
      if(R.isNil(command)) return;

      var game = R.last(args);
      var scope = R.nth(-2, args);
      command.user = scope.user.name;
      command.stamp = R.guid();
      game.commands = R.append(command, game.commands);
      scope.saveGame(game);
    },
  };
  function gameReplay(scope, game) {
    if(R.isEmpty(game.commands)) return;

    var i = 0;
    function gameReplayCmd() {
      commandsService.replay(game.commands[i], scope, game);
      i++;
      if(i >= R.length(game.commands)) {
        scope.$digest();
        return;
      }
      self.requestAnimationFrame(gameReplayCmd);
    }
    self.requestAnimationFrame(gameReplayCmd);
  }
  function jsonFilter(key, value) {
    if(s.startsWith(key, '$$')) {
      return undefined;
    }
    return value;
  }
  return gameService;
};
