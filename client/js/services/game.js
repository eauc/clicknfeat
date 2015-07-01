'use strict';

self.gameServiceFactory = function gameServiceFactory(jsonStringifierService,
                                                      commandsService,
                                                      gameRulerService,
                                                      gameTemplatesService,
                                                      gameTemplateSelectionService,
                                                      gameModelsService,
                                                      gameModelSelectionService,
                                                      gameLayersService) {
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
    load: function gameLoad(scope, data) {
      var game = Object.create(game_proto);
      game = R.deepExtend(game, {
        players: {
          p1: { name: null },
          p2: { name: null }
        },
        board: {},
        scenario: {},
        commands: [],
        undo: [],
        dice: [],
        ruler: gameRulerService.create(),
        models: gameModelsService.create(),
        model_selection: gameModelSelectionService.create(),
        templates: gameTemplatesService.create(),
        template_selection: gameTemplateSelectionService.create(),
        layers: gameLayersService.create(),
      }, data);
      gameReplayAll(scope, game);
      return game;
    },
    toJson: function gameToJson(game) {
      return jsonStringifierService.stringify(game_proto.toJSON.apply(game));
    },
    playerName: function gamePlayerName(p, game) {
      return R.defaultTo('John Doe', R.path(['players',p,'name'], game));
    },
    description: function gameDescription(game) {
      if(R.exists(game.description)) return game.description;
      return ( gameService.playerName('p1', game) +
               ' vs '+
               gameService.playerName('p2', game)
             );
    },
    executeCommand: function gameExecuteCommand(/* ...args..., scope, game */) {
      var args = Array.prototype.slice.apply(arguments);
      var command = commandsService.execute.apply(null, args);
      if(R.isNil(command)) return;

      var game = R.last(args);
      var scope = R.nth(-2, args);
      command.user = scope.user.name;
      command.stamp = R.guid();
      if(!command.do_not_log) {
        game.commands = R.append(command, game.commands);
      }
      scope.saveGame(game);
      scope.gameEvent('command', 'execute');
      return R.clone(command);
    },
    undoLastCommand: function gameUndoLastCommand(scope, game) {
      if(R.isEmpty(game.commands)) return;
      var command = R.last(game.commands);
      commandsService.undo(command, scope, game);
      game.commands = R.init(game.commands);
      game.undo = R.append(command, game.undo);
      scope.saveGame(game);
      scope.gameEvent('command', 'undo');
    },
    replayNextCommand: function gameReplayNextCommand(scope, game) {
      if(R.isEmpty(game.undo)) return;
      var command = R.last(game.undo);
      commandsService.replay(command, scope, game);
      game.undo = R.init(game.undo);
      game.commands = R.append(command, game.commands);
      scope.saveGame(game);
      scope.gameEvent('command', 'replay');
    },
  };
  var game_proto = {
    toJSON: function() {
      return R.pick([
        'players', 'commands', 'undo'
      ], this);
    }
  };
  function gameReplayAll(scope, game) {
    if(R.isEmpty(game.commands)) return;

    var i = 0;
    var replay_batch_size = 10;
    function gameReplayCmd() {
      R.times(function _gameReplayCmd() {
        if(i >= R.length(game.commands)) return;

        commandsService.replay(game.commands[i], scope, game);
        i++;
      }, replay_batch_size);
      if(i >= R.length(game.commands)) {
        scope.deferDigest(scope);
        scope.gameEvent('gameLoaded');
        return;
      }
      self.requestAnimationFrame(gameReplayCmd);
    }
    self.requestAnimationFrame(function _gameReplayAll() {
      scope.gameEvent('gameLoading');
      gameReplayCmd();
    });
  }
  return gameService;
};
