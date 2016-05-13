'use strict';

(function () {
  angular.module('clickApp.services').factory('gameConnection', gameConnectionModelFactory);

  gameConnectionModelFactory.$inject = ['websocket', 'appState'];
  function gameConnectionModelFactory(websocketModel, appStateService) {
    var SOCKET_LENS = R.lensPath(['connection', 'state', 'socket']);

    var gameConnectionModel = {
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
      var connection = {
        state: { socket: null }
      };
      return R.assoc('connection', connection, game);
    }
    function gameConnectionOpenP(user_name, game) {
      if (gameConnectionModel.active(game)) {
        return R.resolveP(game);
      }
      user_name = s.trim(user_name);
      var action = {
        close: 'Game.connection.close',
        chat: 'Game.connection.chat',
        replayCmd: 'Game.connection.replayCmd',
        undoCmd: 'Game.connection.undoCmd',
        cmdBatch: 'Game.connection.batchCmd',
        setCmds: 'Game.connection.setCmds',
        players: 'Game.connection.setPlayers'
      };

      game = R.set(SOCKET_LENS, null, game);
      var url = ['/api/games', R.prop('private_stamp', game) ? 'private' : 'public', R.prop('private_stamp', game) ? R.prop('private_stamp', game) : R.prop('public_stamp', game)].join('/');
      url += '?name=' + user_name;

      return R.threadP()(function () {
        return websocketModel.createP(url, 'game', action);
      }, R.set(SOCKET_LENS, R.__, game));
    }
    function gameConnectionClose(game) {
      if (gameConnectionModel.active(game)) {
        websocketModel.close(game.connection.state.socket);
      }
      return gameConnectionModel.cleanup(game);
    }
    function gameConnectionCleanup(game) {
      return R.set(SOCKET_LENS, null, game);
    }
    function gameConnectionActive(game) {
      return R.thread(game)(R.view(SOCKET_LENS), R.exists);
    }
    function gameConnectionSendReplayCommand(command, game) {
      return R.threadP(game)(gameConnectionModel.sendEvent$({
        type: 'replayCmd',
        cmd: command
      }), R.over(R.lensProp('commands_log'), R.compose(R.append(command), R.defaultTo([]))));
    }
    function gameConnectionSendUndoCommand(command, game) {
      return R.thread(game)(gameConnectionModel.sendEvent$({
        type: 'undoCmd',
        cmd: command
      }), R.over(R.lensProp('undo_log'), R.compose(R.append(command), R.defaultTo([]))));
    }
    function gameConnectionSendEvent(event, game) {
      return R.thread(game)(R.ifElse(gameConnectionModel.active, function () {
        return websocketModel.send(event, R.view(SOCKET_LENS, game));
      }, function () {
        return appStateService.emit('Error', 'gameConnection', 'sendEvent/not active');
      }), R.always(game));
    }
    // function closeHandler() {
    //   appStateService.reduce('Game.connection.close');
    // }
    // function replayCmdHandler(msg) {
    //   appStateService.reduce('Game.command.replay', msg.cmd);
    // }
    // function undoCmdHandler(msg) {
    //   appStateService.reduce('Game.command.undo', msg.cmd);
    // }
    // function cmdBatchHandler(msg) {
    //   appStateService.reduce('Game.command.replayBatch', msg.cmds);
    // }
    // function chatHandler(msg) {
    //   appStateService.reduce('Game.newChatMsg', msg);
    // }
    // function setCmdsHandler(msg) {
    //   appStateService.reduce('Game.setCmds', msg);
    // }
    // function playersHandler(msg) {
    //   appStateService.reduce('Game.setPlayers', msg.players);
    // }
  }
})();
//# sourceMappingURL=connection.js.map
