(function() {
  angular.module('clickApp.services')
    .factory('gameConnection', gameConnectionModelFactory);

  gameConnectionModelFactory.$inject = [
    'websocket',
    'appState',
  ];
  function gameConnectionModelFactory(websocketModel,
                                      appStateService) {
    const SOCKET_LENS = R.lensPath(['connection','state','socket']);
    const COMMANDS_LOG_LENS = R.lensProp('commands_log');
    const UNDO_LOG_LENS = R.lensProp('undo_log');

    const gameConnectionModel = {
      create: gameConnectionCreate,
      openP: gameConnectionOpenP,
      close: gameConnectionClose,
      cleanup: gameConnectionCleanup,
      active: gameConnectionActive,
      sendReplayCommand: gameConnectionSendReplayCommand,
      sendUndoCommand: gameConnectionSendUndoCommand,
      sendEvent: gameConnectionSendEvent
    };
    R.curryService(gameConnectionModel);
    return gameConnectionModel;

    function gameConnectionCreate(game) {
      const connection = {
        state: { socket: null }
      };
      return R.assoc('connection', connection, game);
    }
    function gameConnectionOpenP(user_name, game) {
      if(gameConnectionModel.active(game)) {
        return R.resolveP(game);
      }
      user_name = s.trim(user_name);
      const action = {
        close: 'Game.connection.close',
        chat: 'Game.connection.chat',
        replayCmd: 'Game.connection.replayCmd',
        undoCmd: 'Game.connection.undoCmd',
        cmdBatch: 'Game.connection.batchCmd',
        setCmds: 'Game.connection.setCmds',
        players: 'Game.connection.setPlayers'
      };

      game = R.set(SOCKET_LENS, null, game);
      let url = [
        '/api/games',
        ( R.prop('private_stamp', game)
          ? 'private'
          : 'public'
        ),
        ( R.prop('private_stamp', game)
          ? R.prop('private_stamp', game)
          : R.prop('public_stamp', game)
        )
      ].join('/');
      url += '?name='+user_name;

      return R.threadP()(
        () => websocketModel
          .createP(url, 'game', action),
        R.set(SOCKET_LENS, R.__, game)
      );
    }
    function gameConnectionClose(game) {
      if(gameConnectionModel.active(game)) {
        websocketModel.close(game.connection.state.socket);
      }
      return gameConnectionModel.cleanup(game);
    }
    function gameConnectionCleanup(game) {
      return R.set(SOCKET_LENS, null, game);
    }
    function gameConnectionActive(game) {
      return R.thread(game)(
        R.view(SOCKET_LENS),
        R.exists
      );
    }
    function gameConnectionSendReplayCommand(command, game) {
      return R.thread(game)(
        gameConnectionModel.sendEvent$({
          type: 'replayCmd',
          cmd: command
        }),
        R.over(COMMANDS_LOG_LENS,
               R.compose(R.append(command), R.defaultTo([])))
      );
    }
    function gameConnectionSendUndoCommand(command, game) {
      return R.thread(game)(
        gameConnectionModel.sendEvent$({
          type: 'undoCmd',
          cmd: command
        }),
        R.over(UNDO_LOG_LENS,
               R.compose(R.append(command), R.defaultTo([])))
      );
    }
    function gameConnectionSendEvent(event, game) {
      return R.thread(game)(
        R.ifElse(
          gameConnectionModel.active,
          () => websocketModel
            .send(event, R.view(SOCKET_LENS, game)),
          () => appStateService
            .emit('Error', 'gameConnection', 'sendEvent/not active')
        ),
        R.always(game)
      );
    }
  }
})();
