'use strict';

angular.module('clickApp.services').factory('userConnection', ['http', 'pubSub', 'websocket', function userConnectionServiceFactory(httpService, pubSubService, websocketService) {
  var userConnectionService = {
    create: function userConnectionInit(user) {
      var connection = {
        state: { socket: null },
        channel: pubSubService.init()
      };
      return R.assoc('connection', connection, user);
    },
    open: function userConnectionOpen(user) {
      if (R.exists(user.connection.state.socket)) {
        return self.Promise.resolve(user.connection);
      }

      var handlers = {
        close: closeHandler$(user.connection),
        users: usersMessageHandler$(user.connection),
        games: gamesMessageHandler$(user.connection),
        chat: chatMessageHandler$(user.connection)
      };

      user.connection.state = R.assoc('socket', null, user.connection.state);

      return R.pipeP(function () {
        return websocketService.create('/api/users/' + user.state.stamp, 'user', handlers);
      }, function (socket) {
        user.connection.state = R.assoc('socket', socket, user.connection.state);
        return user;
      })();
    },
    close: function userConnectionClose(user) {
      return R.pipeP(function () {
        if (R.isNil(user.connection.state.socket)) {
          return self.Promise.resolve();
        }
        return websocketService.close(user.connection.state.socket);
      }, function () {
        cleanupConnection(user.connection);
        return user;
      })();
    },
    active: function userConnectionActive(user) {
      return R.pipe(R.path(['connection', 'state', 'socket']), R.exists)(user);
    },
    sendChat: function userConnectionSendChat(dest, msg) {
      var args = Array.prototype.slice.apply(arguments);
      var user = R.last(args);

      if (!userConnectionService.active(user)) {
        return self.Promise.reject('Not active');
      }

      return websocketService.send({
        type: 'chat',
        from: user.state.stamp,
        to: dest,
        msg: msg,
        link: R.length(args) === 4 ? R.nth(2, args) : null
      }, user.connection.state.socket);
    },
    userNameForStamp: function userNameForStamp(stamp, user) {
      return R.pipe(userForStamp$(stamp), R.defaultTo({ name: 'Unknown' }), R.prop('name'), function (n) {
        return s(n).trim().capitalize().value();
      })(user.connection);
    },
    usersNamesForStamps: function usersNamesForStamps(stamps, user) {
      return R.pipe(R.defaultTo({}), R.propOr({}, 'connection'), usersForStamps$(R.defaultTo([], stamps)), R.pluck('name'), function (names) {
        return R.isEmpty(names) ? ['Unknown'] : names;
      }, R.map(function (n) {
        return s(n).trim().capitalize().value();
      }))(user);
    }
  };
  function cleanupConnection(connection) {
    connection.state = R.assoc('socket', null, connection.state);
    connection.users = [];
  }
  function closeHandler$(connection) {
    return function closeHandler() {
      console.log('User connection: close');
      cleanupConnection(connection);
      pubSubService.publish('close', connection.channel);
    };
  }
  var usersMessageHandler$ = R.curry(function usersMessageHandler(connection, msg) {
    console.log('User connection: users list', msg);
    connection.users = R.pipe(R.propOr([], 'users'), R.sortBy(R.compose(R.toLower, R.prop('name'))))(msg);
    pubSubService.publish('users', connection.users, connection.channel);
  });
  var gamesMessageHandler$ = R.curry(function gamesMessageHandler(connection, msg) {
    console.log('User connection: games list', msg);
    connection.games = R.pipe(R.propOr([], 'games'))(msg);
    pubSubService.publish('games', connection.games, connection.channel);
  });
  var chatMessageHandler$ = R.curry(function chatMessageHandler(connection, msg) {
    console.log('User connection: chat msg', msg);
    connection.chat = R.pipe(R.defaultTo([]), R.append(msg))(connection.chat);
    pubSubService.publish('chat', connection.chat, connection.channel);
  });
  var userForStamp$ = R.curry(function userForStamp(stamp, connection) {
    return R.pipe(R.prop('users'), R.find(R.propEq('stamp', stamp)))(connection);
  });
  var usersForStamps$ = R.curry(function usersForStamps(stamps, connection) {
    return R.pipe(R.map(R.flip(userForStamp$)(connection)), R.reject(R.isNil))(stamps);
  });
  return userConnectionService;
}]);
//# sourceMappingURL=userConnection.js.map