'use strict';

angular.module('clickApp.services').factory('gameConnection', ['pubSub', 'websocket', 'commands', function gameConnectionServiceFactory(pubSubService, websocketService, commandsService) {
  var gameConnectionService = {
    create: function gameConnectionInit(game) {
      var connection = {
        state: { socket: null },
        channel: pubSubService.init()
      };
      return R.assoc('connection', connection, game);
    },
    open: function gameConnectionOpen(user_name, scope, game) {
      if (R.exists(game.connection.state.socket)) {
        return self.Promise.resolve(game.connection);
      }
      user_name = s.trim(user_name);

      var handlers = {
        close: closeHandler$(game),
        chat: chatHandler$(scope, game),
        replayCmd: replayCmdHandler$(scope, game),
        undoCmd: undoCmdHandler$(scope, game),
        cmdBatch: cmdBatchHandler$(scope, game),
        setCmds: setCmdsHandler$(scope, game),
        players: playersHandler$(scope, game)
      };

      game.connection.state = R.assoc('socket', null, game.connection.state);

      var url = ['/api/games', R.prop('private_stamp', game) ? 'private' : 'public', R.prop('private_stamp', game) ? R.prop('private_stamp', game) : R.prop('public_stamp', game)].join('/');
      url += '?name=' + user_name;

      return R.pipeP(function () {
        return websocketService.create(url, 'game', handlers);
      }, function (socket) {
        game.connection.state = R.assoc('socket', socket, game.connection.state);
        return game;
      })();
    },
    close: function gameConnectionClose(game) {
      return R.pipeP(function () {
        if (R.isNil(game.connection.state.socket)) {
          return self.Promise.resolve();
        }
        return websocketService.close(game.connection.state.socket);
      }, function () {
        cleanupConnection(game.connection);
        return game;
      })();
    },
    active: function gameConnectionActive(game) {
      return R.pipe(R.path(['connection', 'state', 'socket']), R.exists)(game);
    },
    sendEvent: function gameConnectionSendEvent(event, game) {
      if (!gameConnectionService.active(game)) {
        return self.Promise.reject('Not active');
      }
      return websocketService.send(event, game.connection.state.socket);
    }
  };
  function cleanupConnection(connection) {
    connection.state = R.assoc('socket', null, connection.state);
  }
  function closeHandler$(game) {
    return function closeHandler() {
      console.log('Game connection: close');
      cleanupConnection(game.connection);
      pubSubService.publish('close', game.connection.channel);
    };
  }
  var replayCmdHandler$ = R.curry(function replayCmdHandler(scope, game, msg) {
    console.log('Game connection: replayCmd event', msg);
    return R.pipeP(R.bind(self.Promise.resolve, self.Promise), function (command) {
      if (R.find(R.propEq('stamp', command.stamp), game.commands_log)) {
        game.commands_log = R.reject(R.propEq('stamp', command.stamp), game.commands_log);
        console.log('Game connection: replayCmd log', msg);
        return;
      }
      return commandsService.replay(command, scope, game);
    }, function () {
      game.undo = R.reject(R.propEq('stamp', msg.cmd.stamp), game.undo);
      if (!msg.cmd.do_not_log) {
        game.commands = R.append(msg.cmd, game.commands);
      }
      scope.gameEvent('command', 'replay');

      return scope.saveGame(game);
    })(msg.cmd);
  });
  var undoCmdHandler$ = R.curry(function undoCmdHandler(scope, game, msg) {
    console.log('Game connection: undoCmd event', msg);
    return R.pipeP(R.bind(self.Promise.resolve, self.Promise), function (command) {
      if (R.find(R.propEq('stamp', command.stamp), game.undo_log)) {
        game.undo_log = R.reject(R.propEq('stamp', command.stamp), game.undo_log);
        console.log('Game connection: undoCmd log', msg);
        return;
      }
      return commandsService.undo(command, scope, game);
    }, function () {
      game.commands = R.reject(R.propEq('stamp', msg.cmd.stamp), game.commands);
      game.undo = R.append(msg.cmd, game.undo);

      scope.gameEvent('command', 'undo');

      return scope.saveGame(game);
    })(msg.cmd);
  });
  var cmdBatchHandler$ = R.curry(function cmdBatchHandler(scope, game, msg) {
    console.log('Game connection: cmdBatch event', msg);
    scope.gameEvent('gameLoading');
    return R.pipeP(function () {
      return commandsService.replayBatch(msg.cmds, scope, game);
    }, function () {
      game.commands = R.concat(game.commands, msg.cmds);
      if (msg.end) scope.gameEvent('gameLoaded');

      return scope.saveGame(game);
    })();
  });
  var chatHandler$ = R.curry(function chatHandler(scope, game, msg) {
    console.log('Game connection: chat event', msg);
    game.chat = R.append(msg.chat, game.chat);

    scope.gameEvent('chat');
    return scope.saveGame(game);
  });
  var setCmdsHandler$ = R.curry(function setCmdsHandler(scope, game, msg) {
    console.log('Game connection: setCmds event', msg);
    game[msg.where] = msg.cmds;

    return scope.saveGame(game);
  });
  var playersHandler$ = R.curry(function playersHandler(scope, game, msg) {
    console.log('Game connection: players event', msg);
    game.players = msg.players;

    return scope.saveGame(game);
  });
  R.curryService(gameConnectionService);
  return gameConnectionService;
}]);
//# sourceMappingURL=connection.js.map