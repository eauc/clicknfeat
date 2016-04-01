'use strict';

(function () {
  angular.module('clickApp.services').factory('gameConnection', gameConnectionModelFactory);

  gameConnectionModelFactory.$inject = ['websocket', 'appState'];
  function gameConnectionModelFactory(websocketModel, appStateService) {
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
      var handlers = {
        close: closeHandler,
        chat: chatHandler,
        replayCmd: replayCmdHandler,
        undoCmd: undoCmdHandler,
        cmdBatch: cmdBatchHandler,
        setCmds: setCmdsHandler,
        players: playersHandler
      };

      game = R.assocPath(['connection', 'state', 'socket'], null, game);
      var url = ['/api/games', R.prop('private_stamp', game) ? 'private' : 'public', R.prop('private_stamp', game) ? R.prop('private_stamp', game) : R.prop('public_stamp', game)].join('/');
      url += '?name=' + user_name;

      return R.threadP()(function () {
        return websocketModel.createP(url, 'game', handlers);
      }, function (socket) {
        return R.assocPath(['connection', 'state', 'socket'], socket, game);
      });
    }
    function gameConnectionClose(game) {
      if (gameConnectionModel.active(game)) {
        websocketModel.close(game.connection.state.socket);
      }
      return gameConnectionModel.cleanup(game);
    }
    function gameConnectionCleanup(game) {
      return R.assocPath(['connection', 'state', 'socket'], null, game);
    }
    function gameConnectionActive(game) {
      return R.thread(game)(R.path(['connection', 'state', 'socket']), R.exists);
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
        return websocketModel.send(event, game.connection.state.socket);
      }, function () {
        return appStateService.emit('Error', 'gameConnection', 'sendEvent/not active');
      }), R.always(game));
    }
    function closeHandler() {
      appStateService.reduce('Game.connection.close');
    }
    function replayCmdHandler(msg) {
      appStateService.reduce('Game.command.replay', msg.cmd);
    }
    function undoCmdHandler(msg) {
      appStateService.reduce('Game.command.undo', msg.cmd);
    }
    function cmdBatchHandler(msg) {
      appStateService.reduce('Game.command.replayBatch', msg.cmds);
    }
    function chatHandler(msg) {
      appStateService.reduce('Game.newChatMsg', msg);
    }
    function setCmdsHandler(msg) {
      appStateService.reduce('Game.setCmds', msg);
    }
    function playersHandler(msg) {
      appStateService.reduce('Game.setPlayers', msg.players);
    }
  }
})();
//# sourceMappingURL=connection.js.map
