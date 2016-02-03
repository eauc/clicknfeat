'use strict';

(function () {
  angular.module('clickApp.models').factory('userConnection', userConnectionServiceFactory);

  userConnectionServiceFactory.$inject = ['http', 'pubSub', 'websocket'];
  function userConnectionServiceFactory(httpService, pubSubService, websocketService) {
    var userConnectionService = {
      init: userConnectionInit,
      open: userConnectionOpen,
      close: userConnectionClose,
      active: userConnectionActive,
      sendChat: userConnectionSendChat,
      userNameForStamp: userNameForStamp,
      usersNamesForStamps: usersNamesForStamps
    };
    var usersMessageHandler$ = R.curry(usersMessageHandler);
    var gamesMessageHandler$ = R.curry(gamesMessageHandler);
    var chatMessageHandler$ = R.curry(chatMessageHandler);
    var userForStamp$ = R.curry(userForStamp);
    var usersForStamps$ = R.curry(usersForStamps);
    R.curryService(userConnectionService);
    return userConnectionService;

    function userConnectionInit(user) {
      var connection = {
        state: { socket: null }
      };
      return R.assoc('connection', connection, user);
    }
    function userConnectionOpen(state, user) {
      if (R.exists(user.connection.state.socket)) {
        return self.Promise.resolve(user);
      }

      var handlers = {
        close: closeHandler$(state),
        users: usersMessageHandler$(state),
        games: gamesMessageHandler$(state),
        chat: chatMessageHandler$(state)
      };

      user = R.assocPath(['connection', 'state', 'socket'], null, user);
      return R.pipeP(function () {
        return websocketService.create('/api/users/' + user.state.stamp, 'user', handlers);
      }, function (socket) {
        return R.assocPath(['connection', 'state', 'socket'], socket, user);
      })();
    }
    function userConnectionClose(user) {
      return R.pipeP(function () {
        if (R.isNil(user.connection.state.socket)) {
          return self.Promise.resolve();
        }
        return websocketService.close(user.connection.state.socket);
      }, function () {
        return R.assoc('connection', cleanupConnection(user.connection), user);
      })();
    }
    function userConnectionActive(user) {
      return R.pipe(R.path(['connection', 'state', 'socket']), R.exists)(user);
    }
    function userConnectionSendChat(chat, user) {
      if (!userConnectionService.active(user)) {
        return self.Promise.reject('Not active');
      }

      chat = R.pipe(R.assoc('type', 'chat'), R.assoc('from', user.state.stamp))(chat);
      return websocketService.send(chat, user.connection.state.socket);
    }
    function userNameForStamp(stamp, user) {
      return R.pipe(userForStamp$(stamp), R.defaultTo({ name: 'Unknown' }), R.prop('name'), function (n) {
        return s(n).trim().capitalize().value();
      })(user.connection);
    }
    function usersNamesForStamps(stamps, user) {
      return R.pipe(R.defaultTo({}), R.propOr({}, 'connection'), usersForStamps$(R.defaultTo([], stamps)), R.pluck('name'), function (names) {
        return R.isEmpty(names) ? ['Unknown'] : names;
      }, R.map(function (n) {
        return s(n).trim().capitalize().value();
      }))(user);
    }
    function cleanupConnection(connection) {
      return R.pipe(R.assocPath(['state', 'socket'], null), R.assoc('users', []))(connection);
    }
    function closeHandler$(state) {
      return function () {
        console.error('User connection: close');
        state.event('User.connection.close');
      };
    }
    function usersMessageHandler(state, msg) {
      console.log('User connection: users list', msg);
      state.event('User.setOnlineUsers', R.pipe(R.propOr([], 'users'), R.sortBy(R.compose(R.toLower, R.prop('name'))))(msg));
    }
    function gamesMessageHandler(state, msg) {
      console.log('User connection: games list', msg);
      state.event('User.setOnlineGames', R.pipe(R.propOr([], 'games'))(msg));
    }
    function chatMessageHandler(state, msg) {
      console.log('User connection: chat msg', msg);
      state.event('User.newChatMsg', msg);
    }
    function userForStamp(stamp, connection) {
      return R.pipe(R.prop('users'), R.find(R.propEq('stamp', stamp)))(connection);
    }
    function usersForStamps(stamps, connection) {
      return R.pipe(R.map(R.flip(userForStamp$)(connection)), R.reject(R.isNil))(stamps);
    }
  }
})();
//# sourceMappingURL=connection.js.map
