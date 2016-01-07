'use strict';

angular.module('clickApp.services').factory('gameConnection', ['websocket', function gameConnectionServiceFactory(websocketService) {
  var gameConnectionService = {
    create: function gameConnectionInit(game) {
      var connection = {
        state: { socket: null }
      };
      return R.assoc('connection', connection, game);
    },
    open: function gameConnectionOpen(user_name, state, game) {
      if (R.exists(game.connection.state.socket)) {
        return self.Promise.resolve(game);
      }
      user_name = s.trim(user_name);

      var handlers = {
        close: closeHandler$(state),
        chat: chatHandler$(state),
        replayCmd: replayCmdHandler$(state),
        undoCmd: undoCmdHandler$(state),
        cmdBatch: cmdBatchHandler$(state),
        setCmds: setCmdsHandler$(state),
        players: playersHandler$(state)
      };

      game = R.assocPath(['connection', 'state', 'socket'], null, game);

      var url = ['/api/games', R.prop('private_stamp', game) ? 'private' : 'public', R.prop('private_stamp', game) ? R.prop('private_stamp', game) : R.prop('public_stamp', game)].join('/');
      url += '?name=' + user_name;

      return R.pipeP(function () {
        return websocketService.create(url, 'game', handlers);
      }, function (socket) {
        return R.assocPath(['connection', 'state', 'socket'], socket, game);
      })();
    },
    close: function gameConnectionClose(game) {
      return R.pipePromise(R.path(['connection', 'state', 'socket']), function (socket) {
        if (R.isNil(game)) return null;

        return websocketService.close(socket);
      }, R.always(game), gameConnectionService.cleanup)(game);
    },
    cleanup: function gameConnectionCleanup(game) {
      return R.assocPath(['connection', 'state', 'socket'], null, game);
    },
    active: function gameConnectionActive(game) {
      return R.pipe(R.path(['connection', 'state', 'socket']), R.exists)(game);
    },
    sendReplayCommand: function gameConnectionSendReplayCommand(command, game) {
      return R.pipeP(gameConnectionService.sendEvent$({
        type: 'replayCmd',
        cmd: command
      }), function (game) {
        return R.over(R.lensProp('commands_log'), R.compose(R.append(command), R.defaultTo([])), game);
      })(game);
    },
    sendUndoCommand: function gameConnectionSendUndoCommand(command, game) {
      return R.pipeP(gameConnectionService.sendEvent$({
        type: 'undoCmd',
        cmd: command
      }), function (game) {
        return R.over(R.lensProp('undo_log'), R.compose(R.append(command), R.defaultTo([])), game);
      })(game);
    },
    sendEvent: function gameConnectionSendEvent(event, game) {
      return R.pipePromise(function () {
        if (!gameConnectionService.active(game)) {
          return self.Promise.reject('Not active');
        }
        return websocketService.send(event, game.connection.state.socket);
      }, R.always(game))();
    }
  };
  function closeHandler$(state) {
    return function () {
      console.error('Game connection: close');
      state.event('Game.connection.close');
    };
  }
  var replayCmdHandler$ = R.curry(function (state, msg) {
    console.log('Game connection: replayCmd', msg);
    state.event('Game.command.replay', msg.cmd);
  });
  var undoCmdHandler$ = R.curry(function (state, msg) {
    console.log('Game connection: undoCmd', msg);
    state.event('Game.command.undo', msg.cmd);
  });
  var cmdBatchHandler$ = R.curry(function (state, msg) {
    console.log('Game connection: cmdBatch', msg);
    state.event('Game.command.replayBatch', msg.cmds);
  });
  var chatHandler$ = R.curry(function (state, msg) {
    console.log('Game connection: chat msg', msg);
    state.event('Game.newChatMsg', msg);
  });
  var setCmdsHandler$ = R.curry(function (state, msg) {
    console.log('Game connection: setCmds', msg);
    state.event('Game.setCmds', msg);
  });
  var playersHandler$ = R.curry(function (state, msg) {
    console.log('Game connection: players', msg);
    state.event('Game.setPlayers', msg.players);
  });
  R.curryService(gameConnectionService);
  return gameConnectionService;
}]);
//# sourceMappingURL=connection.js.map
